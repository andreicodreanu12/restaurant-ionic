import React from 'react';

interface ItemProps {
  id?: string;
  title: string;
  description: string;
  price: number;
}

const MenuItem: React.FC<ItemProps> = ({ id, title, description, price }) => {
  return (
    <div>{title} {description}</div>
  );
};

export default MenuItem;