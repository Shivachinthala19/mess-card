export type UserRole = 'student' | 'owner';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Hostel {
  id: string;
  owner_id: string | null;
  name: string;
  description: string;
  area: string;
  city: string;
  address: string;
  monthly_price: number;
  commission_rate: number;
  image_url: string;
  rating: number;
  total_capacity: number;
  filled_capacity: number;
  contact_phone: string;
  amenities: string[];
  food_type: string;
  is_active: boolean;
  created_at: string;
}

export interface WeeklyMenu {
  id: string;
  hostel_id: string;
  day_of_week: number;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner';
  menu_items: string;
  description: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  hostel_id: string;
  user_id: string;
  subscriber_name: string;
  subscriber_phone: string;
  plan_type: 'Breakfast Only' | 'Lunch Only' | 'Dinner Only' | 'Lunch & Dinner' | 'Full';
  start_date: string;
  end_date: string;
  amount_paid: number;
  status: 'Active' | 'Expired' | 'Cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface Review {
  id: string;
  hostel_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SubscriptionWithHostel extends Subscription {
  hostels: Hostel | null;
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'] as const;

export const PLAN_OPTIONS = [
  { type: 'Breakfast Only' as const, label: 'Breakfast Only', discount: 0.3 },
  { type: 'Lunch Only' as const, label: 'Lunch Only', discount: 0.35 },
  { type: 'Dinner Only' as const, label: 'Dinner Only', discount: 0.3 },
  { type: 'Lunch & Dinner' as const, label: 'Lunch & Dinner', discount: 0.7 },
  { type: 'Full' as const, label: 'All Meals (Full)', discount: 1.0 },
];

export const AMENITY_OPTIONS = [
  'WiFi', 'Hot Water', 'Parking', 'Gym', 'AC Rooms', 'Laundry', 'Garden', 'Power Backup',
];

export const FOOD_TYPE_OPTIONS = ['Veg Only', 'Veg & Non-Veg'];
