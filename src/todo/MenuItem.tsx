import React from 'react';

interface ItemProps {
  id?: string;
  title: string;
  description: string;
  price: number;
}

const MenuItem: React.FC<ItemProps> = ({ id, title, description, price }) => {
  return (
    <div>{title}</div>
  );
};

export default MenuItem;