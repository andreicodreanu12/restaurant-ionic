export interface MenuItemProps {
  id?: number,
  title: string,
  description: string,
  price: number,
  introduced_at: string,
  is_expensive: boolean,
  path?: string,
  lat?: number,
  long?: number,
  is_saved?: boolean
}
