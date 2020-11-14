CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create helper function to generate random integer number
CREATE OR REPLACE FUNCTION random_between(low INT ,high INT) 
   RETURNS INT AS
$$
BEGIN
   RETURN floor(random()* (high-low + 1) + low);
END;
$$ language 'plpgsql' STRICT;

-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
	id uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  price integer,
	image_url text
);

-- Create Stocks Table
CREATE TABLE IF NOT EXISTS stocks (
	product_id uuid UNIQUE REFERENCES products (id),
  count integer
);

-- Fill products
INSERT INTO products (title, description, price, image_url)
VALUES
    (
		'Principles: Life and Work',
		'Principles: Life and Work by Ray Dalio',
		2.4,
		'https://images-na.ssl-images-amazon.com/images/I/71rggICc6ZL.jpg'
	),
  	(
		'Stillness Is the Key',
		'Stillness Is the Key by Ryan Holiday',
		10,
		'https://images-na.ssl-images-amazon.com/images/I/71FnArf2ZbL.jpg'
	),
    (
		'The Miracle Morning',
		'The Miracle Morning: The Not-So-Obvious Secret Guaranteed to Transform Your Life (Before 8AM)',
		15,
		'https://images-na.ssl-images-amazon.com/images/I/41GPIof19sL.jpg'
	),
	(
		'The Ride of a Lifetime',
		'The Ride of a Lifetime: Lessons Learned from 15 Years as CEO of the Walt Disney Company',
		23,
		'https://images-na.ssl-images-amazon.com/images/I/81NM735KkyL.jpg'
	),
	(
		'Work Rules!',
		'The Ride of a Lifetime: Lessons Learned from 15 Years as CEO of the Walt Disney CompanyWork Rules!: Insights from Inside Google That Will Transform How You Live and Lead',
		15,
		'https://images-na.ssl-images-amazon.com/images/I/51Df4YVLvbL.jpg'
	),
	(
		'Simple Rules',
		'Simple Rules: How to Thrive in a Complex World',
		23,
		'https://images-na.ssl-images-amazon.com/images/I/61PGDOe1xOL.jpg'
	),
	(
		'The Power of Positive Leadership',
		'The Power of Positive Leadership: How and Why Positive Leaders Transform Teams and Organizations and Change the World',
		20,
		'https://images-na.ssl-images-amazon.com/images/I/51zTXki+YEL.jpg'
	),
	(
		'The Power of Habit',
		'The Power of Habit: Why We Do What We Do in Life and Business',
		7,
		'https://images-na.ssl-images-amazon.com/images/I/81oc6I4sn-L.jpg'
	);

-- Fill stocks
INSERT INTO stocks (product_id, count)
SELECT id as product_id, random_between(0, 10) as count
FROM products;