import { Agent } from '@atproto/api';
import type { NodeSavedSession, NodeSavedState } from '@atproto/oauth-client-node';
import { NodeOAuthClient } from '@atproto/oauth-client-node';
import { prisma } from '@grez/db';
import { env } from '@grez/shared';
import type { FastifyInstance } from 'fastify';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';

const stateStore = new Map<string, NodeSavedState>();
const sessionStore = new Map<string, NodeSavedSession>();

let oauthClient: NodeOAuthClient | null = null;

async function getOAuthClient(): Promise<NodeOAuthClient> {
  if (oauthClient) return oauthClient;

  const config = env();

  const client = new NodeOAuthClient({
    clientMetadata: {
      client_id: config.ATPROTO_CLIENT_ID,
      client_name: 'Grez',
      client_uri: 'http://localhost:3001',
      redirect_uris: [config.ATPROTO_REDIRECT_URI],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      scope: 'atproto transition:generic',
      application_type: 'web',
      dpop_bound_access_tokens: true,
      token_endpoint_auth_method: 'none',
    },
    stateStore: {
      async set(key: string, state: NodeSavedState) {
        stateStore.set(key, state);
      },
      async get(key: string) {
        return stateStore.get(key);
      },
      async del(key: string) {
        stateStore.delete(key);
      },
    },
    sessionStore: {
      async set(key: string, session: NodeSavedSession) {
        sessionStore.set(key, session);
      },
      async get(key: string) {
        return sessionStore.get(key);
      },
      async del(key: string) {
        sessionStore.delete(key);
      },
    },
  });

  oauthClient = client;
  return client;
}

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(env().JWT_SECRET);
}

async function createSessionToken(did: string): Promise<string> {
  return new SignJWT({ did })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<{ did: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { did: string };
  } catch {
    return null;
  }
}

export async function authRoutes(app: FastifyInstance) {
  app.get('/client-metadata.json', async (_request, reply) => {
    const client = await getOAuthClient();
    return reply.send(client.clientMetadata);
  });

  app.post(
    '/login',
    {
      schema: {
        body: z.object({
          handle: z.string().min(1),
        }),
      },
    },
    async (request, reply) => {
      const { handle } = request.body as { handle: string };
      const client = await getOAuthClient();

      try {
        const url = await client.authorize(handle, {
          scope: 'atproto transition:generic',
        });
        return reply.send({ url: url.toString() });
      } catch (err) {
        app.log.error(err, 'OAuth authorization failed');
        return reply.status(500).send({ error: 'Failed to initiate OAuth flow' });
      }
    },
  );

  app.get('/callback', async (request, reply) => {
    const client = await getOAuthClient();
    const params = new URLSearchParams(request.url.split('?')[1]);

    try {
      const { session } = await client.callback(params);
      const did = session.did;

      const agent = new Agent(session);
      const profile = await agent.getProfile({ actor: did });

      await prisma.user.upsert({
        where: { did },
        update: {
          handle: profile.data.handle,
          displayName: profile.data.displayName ?? null,
          avatarUrl: profile.data.avatar ?? null,
        },
        create: {
          did,
          handle: profile.data.handle,
          displayName: profile.data.displayName ?? null,
          avatarUrl: profile.data.avatar ?? null,
          role: did === env().ADMIN_DID ? 'ADMIN' : 'USER',
        },
      });

      const token = await createSessionToken(did);

      reply.setCookie('grez_session', token, {
        httpOnly: true,
        secure: env().NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      const frontendUrl =
        env().NEXT_PUBLIC_API_URL?.replace(':3001', ':3000') || 'http://localhost:3000';
      return reply.redirect(frontendUrl);
    } catch (err) {
      app.log.error(err, 'OAuth callback failed');
      return reply.status(500).send({ error: 'OAuth callback failed' });
    }
  });

  app.post('/logout', async (_request, reply) => {
    reply.clearCookie('grez_session', { path: '/' });
    return reply.send({ ok: true });
  });

  app.get('/me', async (request, reply) => {
    const token = request.cookies.grez_session;
    if (!token) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return reply.status(401).send({ error: 'Invalid session' });
    }

    const user = await prisma.user.findUnique({ where: { did: session.did } });
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    return reply.send({ user });
  });
}
