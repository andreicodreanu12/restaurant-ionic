import { useState } from 'react';
import { getLogger } from '../core';

const log = getLogger('useItems');

export interface ItemProps {
  id?: string,
  title: string,
  description: string,
  price: number;
}

export interface ItemsProps {
  items: ItemProps[],
  addItem: () => void
}

export const useItems: () => ItemsProps = () => {
  const [items, setItems] = useState([
    { id: '1', title: 'Pasta Carbonara', description: 'Main entrees', price: 18 },
    { id: '2', title: 'Salad', description: 'Second courses', price: 20 },
  ]);
  const addItem = () => {
    const id = `${items.length + 1}`;
    const title = `New item ${id}`
    const description = `New description ${id}`
    const price = 30
    log('ItemList addItem');
    setItems(items.concat({ id, title, description, price }));
  };
  log('returns');
  return {
    items,
    addItem
  }
}