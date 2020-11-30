export interface MenuItemProps {
  id?: number,
  title: string,
  description: string,
  price: number,
  introduced_at: string,
  is_expensive: boolean,
  is_saved?: boolean
}
