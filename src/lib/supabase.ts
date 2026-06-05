import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://mzzechpcuthjojvjrnyt.supabase.co';
const supabaseAnonKey = 'sb_publishable_Mi5AQzh6QDHUCSRHiZVgtQ_MD7Vlgb-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
