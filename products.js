// Dazel product catalog — 20 products per category
const DAZEL_CATEGORY_LABELS = {"giftboxes": "Gift Boxes", "jaipuri": "Jaipuri Sets & Necklaces", "earrings": "Earrings", "bracelets": "Bracelets"};

const DAZEL_PRODUCTS = [
  {
    "id": "gi001",
    "cat": "giftboxes",
    "name": "Velvet Heritage Box — 9 Earrings, 5 Bangles & a Keepsake Note",
    "price": 999,
    "mrp": 1820,
    "off": 45,
    "badge": "New",
    "icon": "<rect x=\"8\" y=\"16\" width=\"32\" height=\"24\" rx=\"2\"/><path d=\"M8 22h32\"/><path d=\"M18 16v-2a6 6 0 0112 0v2\"/><circle cx=\"24\" cy=\"29\" r=\"3\"/>"
  },
  {
    "id": "gi002",
    "cat": "giftboxes",
    "name": "Royal Wine Box — Jaipuri Earrings, Kada & Bracelet Trio",
    "price": 1999,
    "mrp": 5000,
    "off": 60,
    "badge": "Bestseller",
    "icon": "<path d=\"M12 14h24l2 8-14 14-14-14z\"/><path d=\"M12 14l6 8h12l6-8\"/><path d=\"M18 22l6 14 6-14\"/>"
  },
  {
    "id": "gi003",
    "cat": "giftboxes",
    "name": "Purse of Surprises Box — Set of 12 Oxidised Studs with Case",
    "price": 999,
    "mrp": 4540,
    "off": 78,
    "badge": "Sale",
    "icon": "<circle cx=\"18\" cy=\"18\" r=\"5\"/><circle cx=\"30\" cy=\"18\" r=\"5\"/><circle cx=\"24\" cy=\"30\" r=\"5\"/><path d=\"M18 23v6M30 23v6M22 30h4\"/>"
  },
  {
    "id": "gi004",
    "cat": "giftboxes",
    "name": "Festive Bloom Box — 12 Jhumka Pairs with Sandesh Card",
    "price": 2499,
    "mrp": 8330,
    "off": 70,
    "badge": "Sale",
    "icon": "<path d=\"M24 8c-6 4-6 12 0 16-6 4-6 12 0 16\"/><path d=\"M24 8c6 4 6 12 0 16 6 4 6 12 0 16\"/>"
  },
  {
    "id": "gi005",
    "cat": "giftboxes",
    "name": "Regal Trousseau Box — Necklace, Earring & Ring Set",
    "price": 999,
    "mrp": 2000,
    "off": 50,
    "badge": "Bestseller",
    "icon": "<rect x=\"10\" y=\"18\" width=\"28\" height=\"20\" rx=\"3\"/><path d=\"M10 24h28M24 18v-3a5 5 0 0110 0v3\"/>"
  },
  {
    "id": "gi006",
    "cat": "giftboxes",
    "name": "Midnight Meena Box — 6 Bangles & Matching Studs",
    "price": 1999,
    "mrp": 9090,
    "off": 78,
    "badge": "Limited",
    "icon": "<rect x=\"8\" y=\"16\" width=\"32\" height=\"24\" rx=\"2\"/><path d=\"M8 22h32\"/><path d=\"M18 16v-2a6 6 0 0112 0v2\"/><circle cx=\"24\" cy=\"29\" r=\"3\"/>"
  },
  {
    "id": "gi007",
    "cat": "giftboxes",
    "name": "Classic Kundan Box — Choker, Earrings & Maang Tikka",
    "price": 999,
    "mrp": 4540,
    "off": 78,
    "badge": "Bestseller",
    "icon": "<path d=\"M12 14h24l2 8-14 14-14-14z\"/><path d=\"M12 14l6 8h12l6-8\"/><path d=\"M18 22l6 14 6-14\"/>"
  },
  {
    "id": "gi008",
    "cat": "giftboxes",
    "name": "Bridal Bloom Box — Anklet Pair & Toe Ring Set",
    "price": 2499,
    "mrp": 8330,
    "off": 70,
    "badge": "Bestseller",
    "icon": "<circle cx=\"18\" cy=\"18\" r=\"5\"/><circle cx=\"30\" cy=\"18\" r=\"5\"/><circle cx=\"24\" cy=\"30\" r=\"5\"/><path d=\"M18 23v6M30 23v6M22 30h4\"/>"
  },
  {
    "id": "gi009",
    "cat": "giftboxes",
    "name": "Everyday Elegance Box — 8 Everyday Stud Pairs",
    "price": 1499,
    "mrp": 4280,
    "off": 65,
    "badge": "Sale",
    "icon": "<path d=\"M24 8c-6 4-6 12 0 16-6 4-6 12 0 16\"/><path d=\"M24 8c6 4 6 12 0 16 6 4 6 12 0 16\"/>"
  },
  {
    "id": "gi010",
    "cat": "giftboxes",
    "name": "Golden Hour Box — Bridal Trousseau Combo",
    "price": 1999,
    "mrp": 6660,
    "off": 70,
    "badge": "New",
    "icon": "<rect x=\"10\" y=\"18\" width=\"28\" height=\"20\" rx=\"3\"/><path d=\"M10 24h28M24 18v-3a5 5 0 0110 0v3\"/>"
  },
  {
    "id": "gi011",
    "cat": "giftboxes",
    "name": "Vintage Rose Box — Meenakari Jhumka & Bangle Duo",
    "price": 899,
    "mrp": 2000,
    "off": 55,
    "badge": "Bestseller",
    "icon": "<rect x=\"8\" y=\"16\" width=\"32\" height=\"24\" rx=\"2\"/><path d=\"M8 22h32\"/><path d=\"M18 16v-2a6 6 0 0112 0v2\"/><circle cx=\"24\" cy=\"29\" r=\"3\"/>"
  },
  {
    "id": "gi012",
    "cat": "giftboxes",
    "name": "Temple Trail Box — Temple Necklace & Earring Set",
    "price": 899,
    "mrp": 1800,
    "off": 50,
    "badge": "Sale",
    "icon": "<path d=\"M12 14h24l2 8-14 14-14-14z\"/><path d=\"M12 14l6 8h12l6-8\"/><path d=\"M18 22l6 14 6-14\"/>"
  },
  {
    "id": "gi013",
    "cat": "giftboxes",
    "name": "Rani Pink Box — 10 Mixed Earring Pairs",
    "price": 1499,
    "mrp": 3000,
    "off": 50,
    "badge": "New",
    "icon": "<circle cx=\"18\" cy=\"18\" r=\"5\"/><circle cx=\"30\" cy=\"18\" r=\"5\"/><circle cx=\"24\" cy=\"30\" r=\"5\"/><path d=\"M18 23v6M30 23v6M22 30h4\"/>"
  },
  {
    "id": "gi014",
    "cat": "giftboxes",
    "name": "Emerald Whisper Box — Kundan Choker & Tikka Set",
    "price": 899,
    "mrp": 2570,
    "off": 65,
    "badge": "Sale",
    "icon": "<path d=\"M24 8c-6 4-6 12 0 16-6 4-6 12 0 16\"/><path d=\"M24 8c6 4 6 12 0 16 6 4 6 12 0 16\"/>"
  },
  {
    "id": "gi015",
    "cat": "giftboxes",
    "name": "Rustic Rani Box — Oxidised Silver Combo Pack",
    "price": 1499,
    "mrp": 6810,
    "off": 78,
    "badge": "Sale",
    "icon": "<rect x=\"10\" y=\"18\" width=\"28\" height=\"20\" rx=\"3\"/><path d=\"M10 24h28M24 18v-3a5 5 0 0110 0v3\"/>"
  },
  {
    "id": "gi016",
    "cat": "giftboxes",
    "name": "Peacock Feather Box — Festive Bangle Stack (Set of 8)",
    "price": 1499,
    "mrp": 3000,
    "off": 50,
    "badge": "Limited",
    "icon": "<rect x=\"8\" y=\"16\" width=\"32\" height=\"24\" rx=\"2\"/><path d=\"M8 22h32\"/><path d=\"M18 16v-2a6 6 0 0112 0v2\"/><circle cx=\"24\" cy=\"29\" r=\"3\"/>"
  },
  {
    "id": "gi017",
    "cat": "giftboxes",
    "name": "Lotus Dawn Box — Layered Necklace Trio",
    "price": 899,
    "mrp": 2720,
    "off": 67,
    "badge": "Limited",
    "icon": "<path d=\"M12 14h24l2 8-14 14-14-14z\"/><path d=\"M12 14l6 8h12l6-8\"/><path d=\"M18 22l6 14 6-14\"/>"
  },
  {
    "id": "gi018",
    "cat": "giftboxes",
    "name": "Sunset Marigold Box — Jhumka & Anklet Combo",
    "price": 1999,
    "mrp": 4000,
    "off": 50,
    "badge": "Sale",
    "icon": "<circle cx=\"18\" cy=\"18\" r=\"5\"/><circle cx=\"30\" cy=\"18\" r=\"5\"/><circle cx=\"24\" cy=\"30\" r=\"5\"/><path d=\"M18 23v6M30 23v6M22 30h4\"/>"
  },
  {
    "id": "gi019",
    "cat": "giftboxes",
    "name": "Silver Filigree Box — Statement Ring Collection",
    "price": 1999,
    "mrp": 5710,
    "off": 65,
    "badge": "Sale",
    "icon": "<path d=\"M24 8c-6 4-6 12 0 16-6 4-6 12 0 16\"/><path d=\"M24 8c6 4 6 12 0 16 6 4 6 12 0 16\"/>"
  },
  {
    "id": "gi020",
    "cat": "giftboxes",
    "name": "Antique Charm Box — Complete Bridal Jewelry Kit",
    "price": 1999,
    "mrp": 4000,
    "off": 50,
    "badge": "Trending",
    "icon": "<rect x=\"10\" y=\"18\" width=\"28\" height=\"20\" rx=\"3\"/><path d=\"M10 24h28M24 18v-3a5 5 0 0110 0v3\"/>"
  },
  {
    "id": "ja021",
    "cat": "jaipuri",
    "name": "Premium Velvet Jewelry Organiser",
    "price": 999,
    "mrp": 4000,
    "off": 75,
    "badge": "New",
    "icon": "<rect x=\"10\" y=\"12\" width=\"28\" height=\"20\" rx=\"2\"/><path d=\"M10 18h28M18 12v-2a6 6 0 0112 0v2\"/>"
  },
  {
    "id": "ja022",
    "cat": "jaipuri",
    "name": "Graceful Floral Earring & Bracelet Combo",
    "price": 599,
    "mrp": 1820,
    "off": 67,
    "badge": "New",
    "icon": "<path d=\"M24 10a10 10 0 100 20 10 10 0 000-20z\"/><path d=\"M24 4v6M24 30v6M4 24h6M38 24h6\"/>"
  },
  {
    "id": "ja023",
    "cat": "jaipuri",
    "name": "Elegant Lotus Necklace & Earring Set",
    "price": 599,
    "mrp": 1710,
    "off": 65,
    "badge": "Sale",
    "icon": "<path d=\"M24 8c8 0 14 8 14 8s-6 8-14 8-14-8-14-8 6-8 14-8z\"/><circle cx=\"24\" cy=\"16\" r=\"3\"/>"
  },
  {
    "id": "ja024",
    "cat": "jaipuri",
    "name": "Traditional Peacock Design Choker Set",
    "price": 1799,
    "mrp": 4000,
    "off": 55,
    "badge": "Limited",
    "icon": "<path d=\"M14 20a10 6 0 0120 0v3a10 6 0 01-20 0z\"/><path d=\"M14 23c0 5 4.5 9 10 9s10-4 10-9\"/>"
  },
  {
    "id": "ja025",
    "cat": "jaipuri",
    "name": "Royal Kundan Necklace with Maang Tikka",
    "price": 599,
    "mrp": 1330,
    "off": 55,
    "badge": "Trending",
    "icon": "<circle cx=\"24\" cy=\"18\" r=\"9\"/><path d=\"M24 27v13M17 40h14\"/><circle cx=\"24\" cy=\"18\" r=\"3\"/>"
  },
  {
    "id": "ja026",
    "cat": "jaipuri",
    "name": "Meenakari Bloom Bridal Set with Earrings",
    "price": 1299,
    "mrp": 3710,
    "off": 65,
    "badge": "Limited",
    "icon": "<rect x=\"10\" y=\"12\" width=\"28\" height=\"20\" rx=\"2\"/><path d=\"M10 18h28M18 12v-2a6 6 0 0112 0v2\"/>"
  },
  {
    "id": "ja027",
    "cat": "jaipuri",
    "name": "Temple Antique Long Necklace Set",
    "price": 599,
    "mrp": 1820,
    "off": 67,
    "badge": "Sale",
    "icon": "<path d=\"M24 10a10 10 0 100 20 10 10 0 000-20z\"/><path d=\"M24 4v6M24 30v6M4 24h6M38 24h6\"/>"
  },
  {
    "id": "ja028",
    "cat": "jaipuri",
    "name": "Rajwadi Pearl Layered Necklace with Studs",
    "price": 599,
    "mrp": 1090,
    "off": 45,
    "badge": "New",
    "icon": "<path d=\"M24 8c8 0 14 8 14 8s-6 8-14 8-14-8-14-8 6-8 14-8z\"/><circle cx=\"24\" cy=\"16\" r=\"3\"/>"
  },
  {
    "id": "ja029",
    "cat": "jaipuri",
    "name": "Oxidised Tribal Choker & Jhumka Set",
    "price": 1299,
    "mrp": 3710,
    "off": 65,
    "badge": "Sale",
    "icon": "<path d=\"M14 20a10 6 0 0120 0v3a10 6 0 01-20 0z\"/><path d=\"M14 23c0 5 4.5 9 10 9s10-4 10-9\"/>"
  },
  {
    "id": "ja030",
    "cat": "jaipuri",
    "name": "Bridal Kundan 5-Piece Trousseau Set",
    "price": 599,
    "mrp": 1820,
    "off": 67,
    "badge": "Bestseller",
    "icon": "<circle cx=\"24\" cy=\"18\" r=\"9\"/><path d=\"M24 27v13M17 40h14\"/><circle cx=\"24\" cy=\"18\" r=\"3\"/>"
  },
  {
    "id": "ja031",
    "cat": "jaipuri",
    "name": "Polki Heritage Statement Necklace Set",
    "price": 1299,
    "mrp": 4330,
    "off": 70,
    "badge": "Trending",
    "icon": "<rect x=\"10\" y=\"12\" width=\"28\" height=\"20\" rx=\"2\"/><path d=\"M10 18h28M18 12v-2a6 6 0 0112 0v2\"/>"
  },
  {
    "id": "ja032",
    "cat": "jaipuri",
    "name": "Jadau Classic Bridal Choker Set",
    "price": 599,
    "mrp": 1710,
    "off": 65,
    "badge": "Bestseller",
    "icon": "<path d=\"M24 10a10 10 0 100 20 10 10 0 000-20z\"/><path d=\"M24 4v6M24 30v6M4 24h6M38 24h6\"/>"
  },
  {
    "id": "ja033",
    "cat": "jaipuri",
    "name": "Chandbali Moon Long Haar with Earrings",
    "price": 599,
    "mrp": 2720,
    "off": 78,
    "badge": "Limited",
    "icon": "<path d=\"M24 8c8 0 14 8 14 8s-6 8-14 8-14-8-14-8 6-8 14-8z\"/><circle cx=\"24\" cy=\"16\" r=\"3\"/>"
  },
  {
    "id": "ja034",
    "cat": "jaipuri",
    "name": "Rani Haar Traditional Necklace Set",
    "price": 999,
    "mrp": 3330,
    "off": 70,
    "badge": "Limited",
    "icon": "<path d=\"M14 20a10 6 0 0120 0v3a10 6 0 01-20 0z\"/><path d=\"M14 23c0 5 4.5 9 10 9s10-4 10-9\"/>"
  },
  {
    "id": "ja035",
    "cat": "jaipuri",
    "name": "Satlada Layered Multi-Layer Necklace Set",
    "price": 1299,
    "mrp": 3940,
    "off": 67,
    "badge": "Bestseller",
    "icon": "<circle cx=\"24\" cy=\"18\" r=\"9\"/><path d=\"M24 27v13M17 40h14\"/><circle cx=\"24\" cy=\"18\" r=\"3\"/>"
  },
  {
    "id": "ja036",
    "cat": "jaipuri",
    "name": "Thewa Art Handcrafted Pendant Set",
    "price": 599,
    "mrp": 2720,
    "off": 78,
    "badge": "Trending",
    "icon": "<rect x=\"10\" y=\"12\" width=\"28\" height=\"20\" rx=\"2\"/><path d=\"M10 18h28M18 12v-2a6 6 0 0112 0v2\"/>"
  },
  {
    "id": "ja037",
    "cat": "jaipuri",
    "name": "Guttapusalu Gold South Indian Necklace Set",
    "price": 299,
    "mrp": 540,
    "off": 45,
    "badge": "Sale",
    "icon": "<path d=\"M24 10a10 10 0 100 20 10 10 0 000-20z\"/><path d=\"M24 4v6M24 30v6M4 24h6M38 24h6\"/>"
  },
  {
    "id": "ja038",
    "cat": "jaipuri",
    "name": "Beaded Nizam Beaded Necklace Set",
    "price": 599,
    "mrp": 1330,
    "off": 55,
    "badge": "Trending",
    "icon": "<path d=\"M24 8c8 0 14 8 14 8s-6 8-14 8-14-8-14-8 6-8 14-8z\"/><circle cx=\"24\" cy=\"16\" r=\"3\"/>"
  },
  {
    "id": "ja039",
    "cat": "jaipuri",
    "name": "Rustic Silver Oxidised Necklace Set",
    "price": 1799,
    "mrp": 3600,
    "off": 50,
    "badge": "Trending",
    "icon": "<path d=\"M14 20a10 6 0 0120 0v3a10 6 0 01-20 0z\"/><path d=\"M14 23c0 5 4.5 9 10 9s10-4 10-9\"/>"
  },
  {
    "id": "ja040",
    "cat": "jaipuri",
    "name": "Meena Paisley Festive Necklace Set",
    "price": 1299,
    "mrp": 5200,
    "off": 75,
    "badge": "Limited",
    "icon": "<circle cx=\"24\" cy=\"18\" r=\"9\"/><path d=\"M24 27v13M17 40h14\"/><circle cx=\"24\" cy=\"18\" r=\"3\"/>"
  },
  {
    "id": "ea041",
    "cat": "earrings",
    "name": "Temple Bell Jhumka Earrings",
    "price": 399,
    "mrp": 1810,
    "off": 78,
    "badge": "Sale",
    "icon": "<circle cx=\"24\" cy=\"12\" r=\"4\"/><path d=\"M24 16c-6 4-6 12 0 16 6-4 6-12 0-16z\"/>"
  },
  {
    "id": "ea042",
    "cat": "earrings",
    "name": "Kundan Drop Drop Earrings",
    "price": 149,
    "mrp": 680,
    "off": 78,
    "badge": "New",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M24 13v10\"/><circle cx=\"24\" cy=\"27\" r=\"6\"/>"
  },
  {
    "id": "ea043",
    "cat": "earrings",
    "name": "Meenakari Stud Earrings",
    "price": 399,
    "mrp": 800,
    "off": 50,
    "badge": "New",
    "icon": "<path d=\"M24 8v6\"/><path d=\"M16 20a8 10 0 0016 0\"/><path d=\"M16 20c0 8 3.5 14 8 18 4.5-4 8-10 8-18\"/>"
  },
  {
    "id": "ea044",
    "cat": "earrings",
    "name": "Oxidised Silver Hoop Earrings",
    "price": 499,
    "mrp": 1110,
    "off": 55,
    "badge": "Trending",
    "icon": "<circle cx=\"24\" cy=\"11\" r=\"3.5\"/><path d=\"M18 16h12l-2 20h-8z\"/>"
  },
  {
    "id": "ea045",
    "cat": "earrings",
    "name": "Pearl Cluster Chandbali Earrings",
    "price": 149,
    "mrp": 430,
    "off": 65,
    "badge": "Limited",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M18 15c-4 6-2 14 6 18 8-4 10-12 6-18\"/>"
  },
  {
    "id": "ea046",
    "cat": "earrings",
    "name": "Jhumka Gold Dangler Earrings",
    "price": 249,
    "mrp": 1130,
    "off": 78,
    "badge": "Sale",
    "icon": "<circle cx=\"24\" cy=\"12\" r=\"4\"/><path d=\"M24 16c-6 4-6 12 0 16 6-4 6-12 0-16z\"/>"
  },
  {
    "id": "ea047",
    "cat": "earrings",
    "name": "Chandbali Bali Earrings",
    "price": 399,
    "mrp": 1810,
    "off": 78,
    "badge": "Limited",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M24 13v10\"/><circle cx=\"24\" cy=\"27\" r=\"6\"/>"
  },
  {
    "id": "ea048",
    "cat": "earrings",
    "name": "Peacock Ear Cuff Set",
    "price": 249,
    "mrp": 550,
    "off": 55,
    "badge": "New",
    "icon": "<path d=\"M24 8v6\"/><path d=\"M16 20a8 10 0 0016 0\"/><path d=\"M16 20c0 8 3.5 14 8 18 4.5-4 8-10 8-18\"/>"
  },
  {
    "id": "ea049",
    "cat": "earrings",
    "name": "Floral Stud Tassel Earrings",
    "price": 249,
    "mrp": 1130,
    "off": 78,
    "badge": "Limited",
    "icon": "<circle cx=\"24\" cy=\"11\" r=\"3.5\"/><path d=\"M18 16h12l-2 20h-8z\"/>"
  },
  {
    "id": "ea050",
    "cat": "earrings",
    "name": "Antique Gold Statement Earrings",
    "price": 149,
    "mrp": 450,
    "off": 67,
    "badge": "Trending",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M18 15c-4 6-2 14 6 18 8-4 10-12 6-18\"/>"
  },
  {
    "id": "ea051",
    "cat": "earrings",
    "name": "Rose Petal Jhumki Pair",
    "price": 149,
    "mrp": 300,
    "off": 50,
    "badge": "New",
    "icon": "<circle cx=\"24\" cy=\"12\" r=\"4\"/><path d=\"M24 16c-6 4-6 12 0 16 6-4 6-12 0-16z\"/>"
  },
  {
    "id": "ea052",
    "cat": "earrings",
    "name": "Kashmiri Kundan Studs",
    "price": 399,
    "mrp": 1000,
    "off": 60,
    "badge": "Sale",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M24 13v10\"/><circle cx=\"24\" cy=\"27\" r=\"6\"/>"
  },
  {
    "id": "ea053",
    "cat": "earrings",
    "name": "Beaded Tassel Layered Danglers",
    "price": 249,
    "mrp": 500,
    "off": 50,
    "badge": "Sale",
    "icon": "<path d=\"M24 8v6\"/><path d=\"M16 20a8 10 0 0016 0\"/><path d=\"M16 20c0 8 3.5 14 8 18 4.5-4 8-10 8-18\"/>"
  },
  {
    "id": "ea054",
    "cat": "earrings",
    "name": "Polki Party Wear Earrings",
    "price": 499,
    "mrp": 1000,
    "off": 50,
    "badge": "Limited",
    "icon": "<circle cx=\"24\" cy=\"11\" r=\"3.5\"/><path d=\"M18 16h12l-2 20h-8z\"/>"
  },
  {
    "id": "ea055",
    "cat": "earrings",
    "name": "Lotus Everyday Studs",
    "price": 249,
    "mrp": 550,
    "off": 55,
    "badge": "Trending",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M18 15c-4 6-2 14 6 18 8-4 10-12 6-18\"/>"
  },
  {
    "id": "ea056",
    "cat": "earrings",
    "name": "Traditional Bali Festive Jhumkas",
    "price": 699,
    "mrp": 1550,
    "off": 55,
    "badge": "New",
    "icon": "<circle cx=\"24\" cy=\"12\" r=\"4\"/><path d=\"M24 16c-6 4-6 12 0 16 6-4 6-12 0-16z\"/>"
  },
  {
    "id": "ea057",
    "cat": "earrings",
    "name": "Filigree Bridal Earrings",
    "price": 699,
    "mrp": 2330,
    "off": 70,
    "badge": "Bestseller",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M24 13v10\"/><circle cx=\"24\" cy=\"27\" r=\"6\"/>"
  },
  {
    "id": "ea058",
    "cat": "earrings",
    "name": "Rajwadi Oxidised Danglers",
    "price": 699,
    "mrp": 1750,
    "off": 60,
    "badge": "New",
    "icon": "<path d=\"M24 8v6\"/><path d=\"M16 20a8 10 0 0016 0\"/><path d=\"M16 20c0 8 3.5 14 8 18 4.5-4 8-10 8-18\"/>"
  },
  {
    "id": "ea059",
    "cat": "earrings",
    "name": "Crescent Moon Pearl Drop Earrings",
    "price": 499,
    "mrp": 1510,
    "off": 67,
    "badge": "Trending",
    "icon": "<circle cx=\"24\" cy=\"11\" r=\"3.5\"/><path d=\"M18 16h12l-2 20h-8z\"/>"
  },
  {
    "id": "ea060",
    "cat": "earrings",
    "name": "Everyday Mini Minimal Studs",
    "price": 699,
    "mrp": 2800,
    "off": 75,
    "badge": "Sale",
    "icon": "<circle cx=\"24\" cy=\"10\" r=\"3\"/><path d=\"M18 15c-4 6-2 14 6 18 8-4 10-12 6-18\"/>"
  },
  {
    "id": "br061",
    "cat": "bracelets",
    "name": "Oxidised Silver Bracelet",
    "price": 349,
    "mrp": 870,
    "off": 60,
    "badge": "Sale",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"9\"/><ellipse cx=\"24\" cy=\"24\" rx=\"10\" ry=\"5.5\"/>"
  },
  {
    "id": "br062",
    "cat": "bracelets",
    "name": "Kundan Cuff Cuff Bracelet",
    "price": 499,
    "mrp": 910,
    "off": 45,
    "badge": "Limited",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><circle cx=\"24\" cy=\"24\" r=\"8\"/>"
  },
  {
    "id": "br063",
    "cat": "bracelets",
    "name": "Beaded Charm Bangle Set (Set of 4)",
    "price": 899,
    "mrp": 2250,
    "off": 60,
    "badge": "Limited",
    "icon": "<path d=\"M9 24a15 6 0 0130 0 15 6 0 01-30 0z\"/><circle cx=\"24\" cy=\"24\" r=\"3\"/>"
  },
  {
    "id": "br064",
    "cat": "bracelets",
    "name": "Gold Plated Charm Bracelet",
    "price": 349,
    "mrp": 630,
    "off": 45,
    "badge": "Sale",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"8\"/><path d=\"M12 24h24\"/>"
  },
  {
    "id": "br065",
    "cat": "bracelets",
    "name": "Meenakari Kada Bracelet",
    "price": 199,
    "mrp": 500,
    "off": 60,
    "badge": "Sale",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><path d=\"M14 24h20M24 14v20\"/>"
  },
  {
    "id": "br066",
    "cat": "bracelets",
    "name": "Antique Temple Adjustable Bracelet",
    "price": 199,
    "mrp": 600,
    "off": 67,
    "badge": "Sale",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"9\"/><ellipse cx=\"24\" cy=\"24\" rx=\"10\" ry=\"5.5\"/>"
  },
  {
    "id": "br067",
    "cat": "bracelets",
    "name": "Chain Link Layered Bracelet",
    "price": 899,
    "mrp": 2250,
    "off": 60,
    "badge": "New",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><circle cx=\"24\" cy=\"24\" r=\"8\"/>"
  },
  {
    "id": "br068",
    "cat": "bracelets",
    "name": "Layered Stack Stack of 6 Bangles",
    "price": 649,
    "mrp": 1620,
    "off": 60,
    "badge": "Limited",
    "icon": "<path d=\"M9 24a15 6 0 0130 0 15 6 0 01-30 0z\"/><circle cx=\"24\" cy=\"24\" r=\"3\"/>"
  },
  {
    "id": "br069",
    "cat": "bracelets",
    "name": "Adjustable Kada Chain Bracelet",
    "price": 349,
    "mrp": 1400,
    "off": 75,
    "badge": "Bestseller",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"8\"/><path d=\"M12 24h24\"/>"
  },
  {
    "id": "br070",
    "cat": "bracelets",
    "name": "Pearl Strand Beaded Bracelet",
    "price": 649,
    "mrp": 2160,
    "off": 70,
    "badge": "Bestseller",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><path d=\"M14 24h20M24 14v20\"/>"
  },
  {
    "id": "br071",
    "cat": "bracelets",
    "name": "Rajwadi Pearl Bracelet",
    "price": 199,
    "mrp": 400,
    "off": 50,
    "badge": "Trending",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"9\"/><ellipse cx=\"24\" cy=\"24\" rx=\"10\" ry=\"5.5\"/>"
  },
  {
    "id": "br072",
    "cat": "bracelets",
    "name": "Floral Cuff Statement Cuff",
    "price": 499,
    "mrp": 1660,
    "off": 70,
    "badge": "Trending",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><circle cx=\"24\" cy=\"24\" r=\"8\"/>"
  },
  {
    "id": "br073",
    "cat": "bracelets",
    "name": "Minimalist Chain Everyday Bracelet",
    "price": 649,
    "mrp": 1180,
    "off": 45,
    "badge": "Sale",
    "icon": "<path d=\"M9 24a15 6 0 0130 0 15 6 0 01-30 0z\"/><circle cx=\"24\" cy=\"24\" r=\"3\"/>"
  },
  {
    "id": "br074",
    "cat": "bracelets",
    "name": "Bridal Kada Party Wear Bracelet",
    "price": 199,
    "mrp": 660,
    "off": 70,
    "badge": "New",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"8\"/><path d=\"M12 24h24\"/>"
  },
  {
    "id": "br075",
    "cat": "bracelets",
    "name": "Boho Beaded Festive Bangle Set",
    "price": 199,
    "mrp": 500,
    "off": 60,
    "badge": "Bestseller",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><path d=\"M14 24h20M24 14v20\"/>"
  },
  {
    "id": "br076",
    "cat": "bracelets",
    "name": "Crystal Charm Minimal Bracelet",
    "price": 349,
    "mrp": 1590,
    "off": 78,
    "badge": "Trending",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"9\"/><ellipse cx=\"24\" cy=\"24\" rx=\"10\" ry=\"5.5\"/>"
  },
  {
    "id": "br077",
    "cat": "bracelets",
    "name": "Everyday Stack Bridal Kada Set",
    "price": 349,
    "mrp": 1160,
    "off": 70,
    "badge": "Bestseller",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><circle cx=\"24\" cy=\"24\" r=\"8\"/>"
  },
  {
    "id": "br078",
    "cat": "bracelets",
    "name": "Traditional Kada Boho Bracelet",
    "price": 499,
    "mrp": 2000,
    "off": 75,
    "badge": "Bestseller",
    "icon": "<path d=\"M9 24a15 6 0 0130 0 15 6 0 01-30 0z\"/><circle cx=\"24\" cy=\"24\" r=\"3\"/>"
  },
  {
    "id": "br079",
    "cat": "bracelets",
    "name": "Rose Gold Crystal Bracelet",
    "price": 199,
    "mrp": 800,
    "off": 75,
    "badge": "Limited",
    "icon": "<ellipse cx=\"24\" cy=\"24\" rx=\"16\" ry=\"8\"/><path d=\"M12 24h24\"/>"
  },
  {
    "id": "br080",
    "cat": "bracelets",
    "name": "Filigree Cuff Traditional Bangle Set",
    "price": 199,
    "mrp": 360,
    "off": 45,
    "badge": "Limited",
    "icon": "<circle cx=\"24\" cy=\"24\" r=\"15\"/><path d=\"M14 24h20M24 14v20\"/>"
  }
];
