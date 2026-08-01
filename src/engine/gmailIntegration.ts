import { google } from 'googleapis';
import { prisma } from '../db/client.js';
import { stepRegistry } from './stepRegistry.js';

const GMAIL_PROVIDER = 'gmail';

export async function getUserToken(userId = 'default-user', provider = GMAIL_PROVIDER) {
  return prisma.userToken.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
  });
}

export async function saveUserToken(params: {
  userId?: string;
  provider?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}) {
  const userId = params.userId || 'default-user';
  const provider = params.provider || GMAIL_PROVIDER;

  return prisma.userToken.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    update: {
      accessToken: params.accessToken,
      refreshToken: params.refreshToken || undefined,
      expiresAt: params.expiresAt,
    },
    create: {
      userId,
      provider,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      expiresAt: params.expiresAt,
    },
  });
}

export async function deleteUserToken(userId = 'default-user', provider = GMAIL_PROVIDER) {
  return prisma.userToken.deleteMany({
    where: { userId, provider },
  });
}

function makeBody(to: string, subject: string, bodyText: string) {
  const str = [
    `To: ${to}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    bodyText,
  ].join('\n');

  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Register Gmail step handler in stepRegistry
stepRegistry.register('gmail_send', async (config, context) => {
  const userId = config.userId || 'default-user';
  const to = config.to;
  const subject = config.subject || 'Automated Workflow Notification';
  const body = config.body || 'No content provided.';

  if (!to) {
    throw new Error('gmail_send step requires a "to" email recipient address in config');
  }

  const tokenRecord = await getUserToken(userId, GMAIL_PROVIDER);

  if (!tokenRecord || !tokenRecord.accessToken) {
    throw new Error(`Gmail OAuth token not found for user "${userId}". Please authorize Gmail in settings/OAuth tab.`);
  }

  let accessToken = tokenRecord.accessToken;

  // Send email via Gmail API
  const raw = makeBody(to, subject, body);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(`Gmail API Error (${res.status}): ${responseData.error?.message || JSON.stringify(responseData)}`);
  }

  return {
    sent: true,
    messageId: responseData.id,
    to,
    subject,
    timestamp: new Date().toISOString(),
  };
});
