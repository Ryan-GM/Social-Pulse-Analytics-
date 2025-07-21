interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}

interface OAuthError {
  error: string;
  errorDescription?: string;
  errorUri?: string;
}

interface PlatformConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
}

export class OAuthService {
  private static platformConfigs: Record<string, PlatformConfig> = {
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID || '',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      userInfoUrl: 'https://graph.instagram.com/me',
      scope: 'user_profile,user_media'
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      userInfoUrl: 'https://api.twitter.com/2/users/me',
      scope: 'tweet.read users.read offline.access'
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me',
      scope: 'pages_read_engagement,pages_read_user_content'
    },
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_ID || '',
      clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
      tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
      userInfoUrl: 'https://open-api.tiktok.com/user/info/',
      scope: 'user.info.basic,video.list'
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID || '',
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: 'https://www.googleapis.com/auth/youtube.readonly'
    }
  };

  static validatePlatformConfig(platform: string): boolean {
    const config = this.platformConfigs[platform];
    if (!config) {
      console.error(`Unsupported platform: ${platform}`);
      return false;
    }

    if (!config.clientId || !config.clientSecret) {
      console.error(`Missing OAuth credentials for ${platform}. Please check environment variables.`);
      return false;
    }

    return true;
  }

  static getAuthorizationUrl(platform: string): string {
    if (!this.validatePlatformConfig(platform)) {
      throw new Error(`Invalid platform configuration: ${platform}`);
    }

    const config = this.platformConfigs[platform];
    const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/oauth/${platform}/callback`;
    const state = this.generateState();

    const authUrls: Record<string, string> = {
      instagram: 'https://api.instagram.com/oauth/authorize',
      twitter: 'https://twitter.com/i/oauth2/authorize',
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
      tiktok: 'https://www.tiktok.com/auth/authorize/',
      youtube: 'https://accounts.google.com/o/oauth2/v2/auth'
    };

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: state
    });

    // Platform-specific parameters
    if (platform === 'twitter') {
      params.append('code_challenge_method', 'S256');
      params.append('code_challenge', this.generateCodeChallenge());
    }

    return `${authUrls[platform]}?${params.toString()}`;
  }

  static async exchangeCodeForTokens(platform: string, code: string, state?: string): Promise<OAuthTokens> {
    if (!this.validatePlatformConfig(platform)) {
      throw new Error(`Invalid platform configuration: ${platform}`);
    }

    const config = this.platformConfigs[platform];
    const redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/oauth/${platform}/callback`;

    try {
      let response: Response;

      switch (platform) {
        case 'instagram':
          response = await this.exchangeInstagramTokens(config, code, redirectUri);
          break;
        case 'twitter':
          response = await this.exchangeTwitterTokens(config, code, redirectUri);
          break;
        case 'facebook':
          response = await this.exchangeFacebookTokens(config, code, redirectUri);
          break;
        case 'tiktok':
          response = await this.exchangeTikTokTokens(config, code, redirectUri);
          break;
        case 'youtube':
          response = await this.exchangeYouTubeTokens(config, code, redirectUri);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Token exchange failed for ${platform}:`, errorData);
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      return this.parseTokenResponse(platform, tokenData);
    } catch (error) {
      console.error(`OAuth token exchange error for ${platform}:`, error);
      throw error;
    }
  }

  private static async exchangeInstagramTokens(config: PlatformConfig, code: string, redirectUri: string): Promise<Response> {
    const formData = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code
    });

    return fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
  }

  private static async exchangeTwitterTokens(config: PlatformConfig, code: string, redirectUri: string): Promise<Response> {
    const formData = new URLSearchParams({
      client_id: config.clientId,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: 'challenge' // In production, store and retrieve the actual code verifier
    });

    const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

    return fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: formData
    });
  }

  private static async exchangeFacebookTokens(config: PlatformConfig, code: string, redirectUri: string): Promise<Response> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      redirect_uri: redirectUri
    });

    return fetch(`${config.tokenUrl}?${params.toString()}`);
  }

  private static async exchangeTikTokTokens(config: PlatformConfig, code: string, redirectUri: string): Promise<Response> {
    const formData = new URLSearchParams({
      client_key: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    return fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
  }

  private static async exchangeYouTubeTokens(config: PlatformConfig, code: string, redirectUri: string): Promise<Response> {
    const formData = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    return fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
  }

  private static parseTokenResponse(platform: string, tokenData: any): OAuthTokens {
    // Handle platform-specific response formats
    switch (platform) {
      case 'instagram':
        return {
          accessToken: tokenData.access_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in
        };
      case 'twitter':
        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in,
          scope: tokenData.scope
        };
      case 'facebook':
        return {
          accessToken: tokenData.access_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in
        };
      case 'tiktok':
        return {
          accessToken: tokenData.data?.access_token,
          refreshToken: tokenData.data?.refresh_token,
          expiresIn: tokenData.data?.expires_in,
          scope: tokenData.data?.scope
        };
      case 'youtube':
        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in,
          scope: tokenData.scope
        };
      default:
        return {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenType: tokenData.token_type,
          expiresIn: tokenData.expires_in
        };
    }
  }

  static async validateAccessToken(platform: string, accessToken: string): Promise<boolean> {
    if (!this.validatePlatformConfig(platform)) {
      return false;
    }

    const config = this.platformConfigs[platform];

    try {
      let response: Response;

      switch (platform) {
        case 'instagram':
          response = await fetch(`${config.userInfoUrl}?access_token=${accessToken}`);
          break;
        case 'twitter':
          response = await fetch(config.userInfoUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          break;
        case 'facebook':
          response = await fetch(`${config.userInfoUrl}?access_token=${accessToken}`);
          break;
        case 'tiktok':
          response = await fetch(config.userInfoUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          break;
        case 'youtube':
          response = await fetch(`${config.userInfoUrl}?access_token=${accessToken}`);
          break;
        default:
          return false;
      }

      return response.ok;
    } catch (error) {
      console.error(`Token validation error for ${platform}:`, error);
      return false;
    }
  }

  static async getUserInfo(platform: string, accessToken: string): Promise<any> {
    if (!this.validatePlatformConfig(platform)) {
      throw new Error(`Invalid platform configuration: ${platform}`);
    }

    const config = this.platformConfigs[platform];

    try {
      let response: Response;

      switch (platform) {
        case 'instagram':
          response = await fetch(`${config.userInfoUrl}?fields=id,username&access_token=${accessToken}`);
          break;
        case 'twitter':
          response = await fetch(`${config.userInfoUrl}?user.fields=username`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          break;
        case 'facebook':
          response = await fetch(`${config.userInfoUrl}?fields=id,name&access_token=${accessToken}`);
          break;
        case 'tiktok':
          response = await fetch(config.userInfoUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          break;
        case 'youtube':
          response = await fetch(`${config.userInfoUrl}?access_token=${accessToken}`);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Get user info error for ${platform}:`, error);
      throw error;
    }
  }

  private static generateState(): string {
    return btoa(Math.random().toString()).substr(10, 5);
  }

  private static generateCodeChallenge(): string {
    // Simple code challenge for demo - in production use proper PKCE
    return btoa(Math.random().toString()).substr(10, 43);
  }
}