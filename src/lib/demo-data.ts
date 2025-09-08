import burgerImage from '../assets/burger-artesanal.jpg';
import pizzaImage from '../assets/pizza-margherita.jpg';
import pastaImage from '../assets/spaghetti-carbonara.jpg';
import dessertImage from '../assets/petit-gateau.jpg';

// Demo data for testing the digital menu system
import type { Product, Table, Menu, Coupon } from './types';

export const demoProducts: Product[] = [
  {
    id: 'burger-01',
    name: 'Burger Artesanal',
    description: 'Hambúrguer 180g de carne bovina, queijo cheddar, alface, tomate, cebola roxa e molho especial da casa. Acompanha batata rústica.',
    imageUrl: burgerImage,
    category: 'Hambúrgueres',
    price: 2890, // R$ 28,90
    available: true,
    position: 1,
    isHighlighted: true,
    options: [
      {
        id: 'protein-level',
        name: 'Ponto da Carne',
        required: true,
        maxSelections: 1,
        choices: [
          { id: 'rare', name: 'Mal Passada', price: 0 },
          { id: 'medium', name: 'Ao Ponto', price: 0 },
          { id: 'well-done', name: 'Bem Passada', price: 0 }
        ]
      },
      {
        id: 'extras',
        name: 'Adicionais',
        required: false,
        maxSelections: 3,
        choices: [
          { id: 'bacon', name: 'Bacon Crocante', price: 590 },
          { id: 'egg', name: 'Ovo Frito', price: 390 },
          { id: 'cheese-extra', name: 'Queijo Extra', price: 490 }
        ]
      }
    ]
  },
  {
    id: 'pizza-01',
    name: 'Pizza Margherita',
    description: 'Molho de tomate artesanal, mussarela de búfala, manjericão fresco e azeite extravirgem. Massa fermentada por 48h.',
    imageUrl: pizzaImage,
    category: 'Pizzas',
    price: 3490,
    available: true,
    position: 1,
    options: [
      {
        id: 'size',
        name: 'Tamanho',
        required: true,
        maxSelections: 1,
        choices: [
          { id: 'small', name: 'Pequena (25cm)', price: 0 },
          { id: 'medium', name: 'Média (30cm)', price: 800 },
          { id: 'large', name: 'Grande (35cm)', price: 1500 }
        ]
      },
      {
        id: 'crust',
        name: 'Tipo de Massa',
        required: false,
        maxSelections: 1,
        choices: [
          { id: 'thin', name: 'Fina', price: 0 },
          { id: 'thick', name: 'Grossa', price: 0 },
          { id: 'stuffed', name: 'Borda Recheada', price: 690 }
        ]
      }
    ]
  },
  {
    id: 'pasta-01',
    name: 'Spaghetti Carbonara',
    description: 'Massa fresca italiana com molho cremoso, bacon defumado, queijo parmesão e gema de ovo caipira.',
    imageUrl: pastaImage,
    category: 'Massas',
    price: 2690,
    available: true,
    position: 1,
    isDaySpecial: true
  },
  {
    id: 'salad-01',
    name: 'Salada Caesar',
    description: 'Mix de folhas verdes, croutons artesanais, queijo parmesão laminado e molho caesar tradicional.',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    category: 'Saladas',
    price: 1890,
    available: true,
    position: 1,
    options: [
      {
        id: 'protein-add',
        name: 'Adicionar Proteína',
        required: false,
        maxSelections: 1,
        choices: [
          { id: 'grilled-chicken', name: 'Frango Grelhado', price: 890 },
          { id: 'grilled-beef', name: 'Carne Grelhada', price: 1290 },
          { id: 'shrimp', name: 'Camarão Grelhado', price: 1590 }
        ]
      }
    ]
  },
  {
    id: 'drink-01',
    name: 'Refrigerante 350ml',
    description: 'Coca-Cola, Guaraná, Fanta ou Sprite gelados.',
    category: 'Bebidas',
    price: 590,
    available: true,
    position: 1,
    options: [
      {
        id: 'flavor',
        name: 'Sabor',
        required: true,
        maxSelections: 1,
        choices: [
          { id: 'coke', name: 'Coca-Cola', price: 0 },
          { id: 'guarana', name: 'Guaraná Antártica', price: 0 },
          { id: 'fanta', name: 'Fanta Laranja', price: 0 },
          { id: 'sprite', name: 'Sprite', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'drink-02',
    name: 'Suco Natural 400ml',
    description: 'Sucos naturais da fruta, preparados na hora sem conservantes.',
    category: 'Bebidas',
    price: 890,
    available: true,
    position: 2,
    isHighlighted: true,
    options: [
      {
        id: 'fruit',
        name: 'Fruta',
        required: true,
        maxSelections: 1,
        choices: [
          { id: 'orange', name: 'Laranja', price: 0 },
          { id: 'acerola', name: 'Acerola', price: 0 },
          { id: 'pineapple', name: 'Abacaxi', price: 0 },
          { id: 'passion-fruit', name: 'Maracujá', price: 190 },
          { id: 'strawberry', name: 'Morango', price: 290 }
        ]
      },
      {
        id: 'preparation',
        name: 'Preparo',
        required: false,
        maxSelections: 1,
        choices: [
          { id: 'pure', name: 'Natural', price: 0 },
          { id: 'with-milk', name: 'Com Leite', price: 190 },
          { id: 'with-water', name: 'Com Água', price: 0 }
        ]
      }
    ]
  },
  {
    id: 'dessert-01',
    name: 'Petit Gateau',
    description: 'Bolinho de chocolate quente com recheio cremoso, acompanha sorvete de baunilha e calda de frutas vermelhas.',
    imageUrl: dessertImage,
    category: 'Sobremesas',
    price: 1690,
    available: true,
    position: 1,
    isDaySpecial: true
  },
  {
    id: 'coffee-01',
    name: 'Café Expresso',
    description: 'Café especial torrado na casa, extraído na pressão ideal.',
    category: 'Cafés',
    price: 490,
    available: true,
    position: 1,
    options: [
      {
        id: 'size-coffee',
        name: 'Tamanho',
        required: true,
        maxSelections: 1,
        choices: [
          { id: 'single', name: 'Simples', price: 0 },
          { id: 'double', name: 'Duplo', price: 290 }
        ]
      }
    ]
  }
];

export const demoTables: Table[] = [
  { id: 'table-01', number: '01', active: true },
  { id: 'table-02', number: '02', active: true },
  { id: 'table-03', number: '03', active: true },
  { id: 'table-04', number: '04', active: true },
  { id: 'table-05', number: '05', active: true },
  { id: 'table-06', number: '06', active: true },
  { id: 'table-07', number: '07', active: true },
  { id: 'table-08', number: '08', active: true },
  { id: 'table-09', number: '09', active: true },
  { id: 'table-10', number: '10', active: true }
];

export const demoMenu: Menu = {
  id: 'menu-01',
  active: true,
  categories: [
    { name: 'Hambúrgueres', position: 1 },
    { name: 'Pizzas', position: 2 },
    { name: 'Massas', position: 3 },
    { name: 'Saladas', position: 4 },
    { name: 'Bebidas', position: 5 },
    { name: 'Sobremesas', position: 6 },
    { name: 'Cafés', position: 7 }
  ],
  visibility: ['dine_in', 'takeaway', 'delivery']
};

export const demoCoupons: Coupon[] = [
  {
    id: 'coupon-01',
    code: 'BEMVINDO10',
    type: 'percent',
    value: 10,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    minSubtotal: 2000, // R$ 20,00
    active: true
  },
  {
    id: 'coupon-02',
    code: 'DESCONTO5',
    type: 'fixed',
    value: 500, // R$ 5,00
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    active: true
  },
  {
    id: 'coupon-03',
    code: 'FRETE0',
    type: 'fixed',
    value: 590, // R$ 5,90 (valor da taxa de entrega)
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    minSubtotal: 5000, // R$ 50,00
    active: true
  }
];

// Helper function to get demo data by restaurant ID
export function getDemoData(restaurantId: string) {
  return {
    products: demoProducts,
    tables: demoTables,
    menu: demoMenu,
    coupons: demoCoupons
  };
}