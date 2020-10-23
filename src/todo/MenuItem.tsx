import React from 'react';
import { ItemProps } from './useItems'

const MenuItem: React.FC<ItemProps> = ({ id, title, description, price }) => {
  return (
    <div>{title} {description}</div>
  );
};

export default MenuItem;