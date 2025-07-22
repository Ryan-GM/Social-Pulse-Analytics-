import { Request, Response } from 'express';
import { supabase, db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
}

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, username: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create user record in our database
        const [newUser] = await db.insert(users).values({
          username,
          email,
          supabaseUserId: data.user.id,
        }).returning();

        return { user: data.user, profile: newUser };
      }

      return { user: null, profile: null };
    } catch (error) {
      throw error;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Get user profile from our database
        const [userProfile] = await db
          .select()
          .from(users)
          .where(eq(users.supabaseUserId, data.user.id))
          .limit(1);

        return { user: data.user, profile: userProfile, session: data.session };
      }

      return { user: null, profile: null, session: null };
    } catch (error) {
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(accessToken: string) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      
      if (error) {
        throw new Error(error.message);
      }

      if (user) {
        // Get user profile from our database
        const [userProfile] = await db
          .select()
          .from(users)
          .where(eq(users.supabaseUserId, user.id))
          .limit(1);

        return { user, profile: userProfile };
      }

      return { user: null, profile: null };
    } catch (error) {
      throw error;
    }
  }

  // Middleware to verify authentication
  static async verifyAuth(req: Request, res: Response, next: Function) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const { user, profile } = await AuthService.getCurrentUser(token);

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Attach user info to request
      req.user = { ...user, profile };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.CLIENT_URL}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Update password
  static async updatePassword(newPassword: string, accessToken: string) {
    try {
      // Set the session first
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', // This should be provided if available
      });

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile by Supabase user ID
  static async getUserProfile(supabaseUserId: string) {
    try {
      const [userProfile] = await db
        .select()
        .from(users)
        .where(eq(users.supabaseUserId, supabaseUserId))
        .limit(1);

      return userProfile;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(supabaseUserId: string, updates: Partial<typeof users.$inferInsert>) {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.supabaseUserId, supabaseUserId))
        .returning();

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser & { profile?: any };
    }
  }
}
