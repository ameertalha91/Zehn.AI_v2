import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          centerId: user.centerId,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // OAuth sign-in: find or create user in DB
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        if (!user.email) return false;

        const providerIdField = account.provider === 'google' ? 'googleId' : 'facebookId';

        let dbUser = await db.user.findUnique({ where: { email: user.email } });

        if (!dbUser) {
          // New OAuth user — create as STUDENT with PENDING_APPROVAL
          dbUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name ?? user.email.split('@')[0],
              image: user.image ?? null,
              role: 'STUDENT',
              status: 'PENDING_APPROVAL',
              [providerIdField]: account.providerAccountId,
            },
          });
        } else if (!dbUser[providerIdField as keyof typeof dbUser]) {
          // Link OAuth provider to existing account
          await db.user.update({
            where: { id: dbUser.id },
            data: { [providerIdField]: account.providerAccountId },
          });
        }

        // Attach DB fields to the token via jwt callback
        user.id = dbUser.id;
        (user as any).role = dbUser.role;
        (user as any).status = dbUser.status;
        (user as any).centerId = dbUser.centerId;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'STUDENT';
        token.status = (user as any).status ?? 'PENDING_APPROVAL';
        token.centerId = (user as any).centerId ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      (session.user as any).status = token.status;
      (session.user as any).centerId = token.centerId;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
});
