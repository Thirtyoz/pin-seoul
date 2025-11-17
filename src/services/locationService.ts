import { supabase } from '@/lib/supabase';
import type { DangilPath, Festival, NightViewSpot, MapLocation } from '@/types/location';

// 서울시 공공데이터 이미지 베이스 URL
const SEOUL_DATA_BASE_URL = 'https://gis.seoul.go.kr';

/**
 * Fetch walking paths (dangil_paths) from Supabase
 */
export async function fetchDangilPaths(): Promise<MapLocation[]> {
  const { data, error } = await supabase
    .from('dangil_paths')
    .select('*')
    .limit(50); // Limit to 50 for performance

  if (error) {
    console.error('Error fetching dangil_paths:', error);
    return [];
  }

  return (data as DangilPath[]).map(path => ({
    id: path.id,
    name: path.conts_name || path.name01,
    type: 'path' as const,
    location: {
      lat: path.coord_y,
      lng: path.coord_x,
    },
    description: path.value01 || path.name02 || '',
    address: path.addr_new || path.addr_old || '',
    tel: path.tel,
    imageUrl: path.image_main_url ? `${SEOUL_DATA_BASE_URL}${path.image_main_url}` : '/penguin.png',
    coordinates: path.coord_data?.coordinates || [],
    contsName: path.conts_name,
    themeName: path.theme_name,
  }));
}

/**
 * Fetch festivals from Supabase
 */
export async function fetchFestivals(): Promise<MapLocation[]> {
  const { data, error } = await supabase
    .from('festivals')
    .select('*')
    .limit(100); // Limit to 100 for performance

  if (error) {
    console.error('Error fetching festivals:', error);
    return [];
  }

  return (data as Festival[]).map(festival => ({
    id: festival.id,
    name: festival.conts_name || festival.name01,
    type: 'festival' as const,
    location: {
      lat: festival.coord_y,
      lng: festival.coord_x,
    },
    description: festival.name02 || festival.value01 || '',
    date: festival.value02 || '',
    address: festival.addr_new || festival.addr_old || '',
    tel: festival.tel,
    imageUrl: festival.image_main_url ? `${SEOUL_DATA_BASE_URL}${festival.image_main_url}` : '/penguin.png',
    contsName: festival.conts_name,
    themeName: festival.theme_name,
  }));
}

/**
 * Fetch night view spots from Supabase
 */
export async function fetchNightViewSpots(): Promise<MapLocation[]> {
  const { data, error } = await supabase
    .from('night_view_spots')
    .select('*')
    .limit(100); // Limit to 100 for performance

  if (error) {
    console.error('Error fetching night_view_spots:', error);
    return [];
  }

  return (data as NightViewSpot[]).map(spot => ({
    id: spot.id,
    name: spot.conts_name || spot.name01,
    type: 'night_view' as const,
    location: {
      lat: spot.coord_y,
      lng: spot.coord_x,
    },
    description: spot.name02 || spot.value01 || '',
    date: spot.value02 || '',
    address: spot.addr_new || spot.addr_old || '',
    tel: spot.tel,
    imageUrl: spot.image_main_url ? `${SEOUL_DATA_BASE_URL}${spot.image_main_url}` : '/penguin.png',
    contsName: spot.conts_name,
    themeName: spot.theme_name,
  }));
}

/**
 * Fetch all locations (paths + festivals + night views)
 */
export async function fetchAllLocations(): Promise<MapLocation[]> {
  const [paths, festivals, nightViews] = await Promise.all([
    fetchDangilPaths(),
    fetchFestivals(),
    fetchNightViewSpots(),
  ]);

  return [...paths, ...festivals, ...nightViews];
}
