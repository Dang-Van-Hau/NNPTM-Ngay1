//Câu 1: 
function product(id, name, price, quantity, category, isAvailable)  {  
    this.id = id;  
    this.name = name;  
    this.price = price;  
    this.quantity = quantity;  
    this.category = category;  
    this.isAvailable = isAvailable;  
}

//Câu 2:
let products = [
new product(1, "Laptop", 1500, 10, "Electronics", true),
new product(2, "Smartphone", 800, 20, "Electronics", true),
new product(3, "Desk Chair", 120, 15, "Furniture", false),   
new product(4, "Book", 20, 50, "Stationery", true),
new product(5, "Headphones", 100, 30, "Electronics", true),
];

//Câu 3: 
let nameAndPrice = products.map(p => ({
    name: p.name,     
    price: p.price   
}));
console.log("Câu 3:", nameAndPrice);

//Câu 4:
let inStockProducts = products.filter(p => p.quantity > 0);
console.log("Câu 4:", inStockProducts);

//Câu 5:
let hasExpensiveProduct = products.some(p => p.price > 30000000);
console.log("Câu 5:", hasExpensiveProduct);

//Câu 6:
let accessoriesAvailable = products
    .filter(p => p.category === "Accessories")
    .every(p => p.isAvailable === true);

console.log("Câu 6:", accessoriesAvailable);

//Câu 7:
let totalInventoryValue = products.reduce(
    (total, p) => total + p.price * p.quantity,
    0
);
console.log("Câu 7: Tổng giá trị kho =", totalInventoryValue);

//Câu 8:
console.log("Câu 8:");
for (let p of products) {
    let status = p.isAvailable ? "Đang bán" : "Ngừng bán";
    console.log(`${p.name} - ${p.category} - ${status}`);
}

//Câu 9:
console.log("Câu 9:");
let sampleProduct = products[0]; 
for (let key in sampleProduct) {
    console.log(key + ":", sampleProduct[key]);
}

//Câu 10:
let sellingAndInStockNames = products
    .filter(p => p.isAvailable === true && p.quantity > 0)
    .map(p => p.name);

console.log("Câu 10:", sellingAndInStockNames);