/**
 * Protocol Handler for custom URL scheme
 * Handles web+dinemaison:// protocol URLs
 * 
 * Example URLs:
 * - web+dinemaison://book/chef-id
 * - web+dinemaison://messages/conversation-id
 * - web+dinemaison://chef/profile-id
 */

export type ProtocolAction = 
  | 'book'
  | 'messages'
  | 'chef'
  | 'bookings'
  | 'menu'
  | 'home';

export interface ProtocolHandlerOptions {
  action: ProtocolAction;
  params?: Record<string, string>;
  id?: string;
}

/**
 * Parse a protocol URL into action and parameters
 */
export function parseProtocolUrl(url: string): ProtocolHandlerOptions | null {
  try {
    // Check if it's a valid protocol URL
    if (!url.startsWith('web+dinemaison://')) {
      return null;
    }

    // Remove protocol prefix
    const path = url.replace('web+dinemaison://', '');
    
    // Split into parts
    const parts = path.split('/');
    const action = parts[0] as ProtocolAction;
    const id = parts[1];
    
    // Parse query parameters if present
    const queryStart = path.indexOf('?');
    const params: Record<string, string> = {};
    
    if (queryStart !== -1) {
      const queryString = path.substring(queryStart + 1);
      const urlParams = new URLSearchParams(queryString);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return {
      action,
      id,
      params: Object.keys(params).length > 0 ? params : undefined,
    };
  } catch (error) {
    console.error('Error parsing protocol URL:', error);
    return null;
  }
}

/**
 * Handle a protocol URL by navigating to the appropriate route
 */
export function handleProtocolUrl(url: string): string | null {
  const parsed = parseProtocolUrl(url);
  
  if (!parsed) {
    return null;
  }

  const { action, id, params } = parsed;

  // Map actions to routes
  switch (action) {
    case 'book':
      return id ? `/book/${id}` : '/chefs';
    
    case 'messages':
      return id ? `/dashboard/messages?conversation=${id}` : '/dashboard/messages';
    
    case 'chef':
      return id ? `/chefs/${id}` : '/chefs';
    
    case 'bookings':
      return id ? `/dashboard/bookings/${id}` : '/dashboard/bookings';
    
    case 'menu':
      return '/menu';
    
    case 'home':
      return '/';
    
    default:
      return '/';
  }
}

/**
 * Check if protocol handler is supported
 */
export function isProtocolHandlerSupported(): boolean {
  return 'registerProtocolHandler' in navigator;
}

/**
 * Register the protocol handler
 */
export function registerProtocolHandler(): void {
  if (!isProtocolHandlerSupported()) {
    console.warn('Protocol handlers not supported in this browser');
    return;
  }

  try {
    // Note: This is registered in the manifest, but we can also register it programmatically
    // However, most browsers prefer manifest registration
    console.log('Protocol handler registered via manifest');
  } catch (error) {
    console.error('Error registering protocol handler:', error);
  }
}

/**
 * Create a protocol URL
 */
export function createProtocolUrl(action: ProtocolAction, id?: string, params?: Record<string, string>): string {
  let url = `web+dinemaison://${action}`;
  
  if (id) {
    url += `/${id}`;
  }
  
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  return url;
}

/**
 * Initialize protocol handler
 * Call this on app startup
 */
export function initProtocolHandler(): void {
  // Check if we were opened via a protocol URL
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  if (action) {
    // We were opened via protocol handler
    const route = handleProtocolUrl(action);
    if (route && route !== window.location.pathname) {
      // Navigate to the appropriate route
      window.location.href = route;
    }
  }
  
  // Register the handler
  registerProtocolHandler();
}


