export interface Destination {
  id: string;
  name: string;
  country: string;
  rating: number;
  imageUrl: string;
  tag?: string;
}

export const POPULAR_DESTINATIONS: Destination[] = [
  {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'maldives',
    name: 'Maldives',
    country: 'Indian Ocean',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'swiss-alps',
    name: 'Swiss Alps',
    country: 'Switzerland',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
  },
];
