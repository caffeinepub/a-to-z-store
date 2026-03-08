import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type Product = {
    id : Nat;
    name : Text;
    category : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    stock : Nat;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [CartItem];
    totalPrice : Nat;
    status : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    address : Text;
  };

  let products = Map.empty<Nat, Product>();
  let userCarts = Map.empty<Principal, Map.Map<Nat, Nat>>();
  let orders = Map.empty<Nat, Order>();
  let productCategories = Set.empty<Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextProductId = 1;
  var nextOrderId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Seed Products - Admin only
  public shared ({ caller }) func seedProducts() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed products");
    };

    let productsArray = [
      // Keyrings
      {
        name = "Classic Leather Keyring";
        category = "Keyrings";
        description = "Elegant leather keyring with metal clasp";
        price = 1299;
        imageUrl = "/images/keyring1.jpg";
        stock = 25;
      },
      {
        name = "Galaxy Keychain";
        category = "Keyrings";
        description = "Colorful galaxy-themed keychain";
        price = 899;
        imageUrl = "/images/keyring2.jpg";
        stock = 40;
      },
      {
        name = "Minimalist Metal Loop";
        category = "Keyrings";
        description = "Sleek metal keyring for modern style";
        price = 1599;
        imageUrl = "/images/keyring3.jpg";
        stock = 15;
      },
      // Pencil Boxes
      {
        name = "Boho Pencil Box";
        category = "Pencil Boxes";
        description = "Fabric pencil box with boho patterns";
        price = 2299;
        imageUrl = "/images/pencilbox1.jpg";
        stock = 20;
      },
      {
        name = "Transparent Stationery Case";
        category = "Pencil Boxes";
        description = "Clear plastic case with compartments";
        price = 1799;
        imageUrl = "/images/pencilbox2.jpg";
        stock = 30;
      },
      {
        name = "Floral Design Pencil Box";
        category = "Pencil Boxes";
        description = "Metal box with floral patterns";
        price = 1899;
        imageUrl = "/images/pencilbox3.jpg";
        stock = 18;
      },
      // Kids Folders
      {
        name = "Space Adventure Folder";
        category = "Kids Folders";
        description = "Durable folder with space theme";
        price = 799;
        imageUrl = "/images/folder1.jpg";
        stock = 50;
      },
      {
        name = "Underwater Creatures Folder";
        category = "Kids Folders";
        description = "Folder with colorful sea animals";
        price = 899;
        imageUrl = "/images/folder2.jpg";
        stock = 45;
      },
      {
        name = "Superhero Organizer";
        category = "Kids Folders";
        description = "Folder with popular superhero prints";
        price = 999;
        imageUrl = "/images/folder3.jpg";
        stock = 38;
      },
      // Perfumes
      {
        name = "Fresh Citrus Perfume";
        category = "Perfumes";
        description = "Refreshing citrus blend scent";
        price = 3999;
        imageUrl = "/images/perfume1.jpg";
        stock = 12;
      },
      {
        name = "Floral Essence Perfume";
        category = "Perfumes";
        description = "Delicate blend of floral scents";
        price = 4499;
        imageUrl = "/images/perfume2.jpg";
        stock = 8;
      },
      {
        name = "Spice Fusion Perfume";
        category = "Perfumes";
        description = "Warm, spicy scent for evening wear";
        price = 4899;
        imageUrl = "/images/perfume3.jpg";
        stock = 10;
      },
      // Cases
      {
        name = "Slim Phone Case";
        category = "Cases";
        description = "Ultra-thin protective phone case";
        price = 2199;
        imageUrl = "/images/case1.jpg";
        stock = 35;
      },
      {
        name = "Vintage Laptop Sleeve";
        category = "Cases";
        description = "Laptop sleeve with vintage patterns";
        price = 2999;
        imageUrl = "/images/case2.jpg";
        stock = 16;
      },
      {
        name = "Tablet Protective Case";
        category = "Cases";
        description = "Shockproof case for tablets";
        price = 2599;
        imageUrl = "/images/case3.jpg";
        stock = 22;
      },
    ];

    productsArray.forEach(
      func(item) {
        let product = {
          id = nextProductId;
          name = item.name;
          category = item.category;
          description = item.description;
          price = item.price;
          imageUrl = item.imageUrl;
          stock = item.stock;
        };
        products.add(nextProductId, product);
        productCategories.add(item.category);
        nextProductId += 1;
      }
    );
  };

  // Public product browsing - no auth required
  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  // Cart operations - user only
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity <= 0) { Runtime.trap("Quantity must be at least 1") };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    if (product.stock < quantity) { Runtime.trap("Not enough stock available") };

    let cart = switch (userCarts.get(caller)) {
      case (null) {
        let newCart = Map.empty<Nat, Nat>();
        userCarts.add(caller, newCart);
        newCart;
      };
      case (?c) { c };
    };
    cart.add(productId, quantity);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart.remove(productId) };
    };
  };

  public shared ({ caller }) func updateCartQuantity(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    if (quantity <= 0) { Runtime.trap("Quantity must be at least 1") };
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };
    if (product.stock < quantity) { Runtime.trap("Not enough stock available") };

    switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart.add(productId, quantity) };
    };
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?cart) {
        cart.entries().toArray().map(
          func((productId, quantity)) {
            { productId; quantity };
          }
        );
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    userCarts.remove(caller);
  };

  // Order operations - user only
  public shared ({ caller }) func placeOrder() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (userCarts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?c) { c };
    };

    let cartItems = cart.entries().toArray().map(
      func((productId, quantity)) {
        { productId; quantity };
      }
    );

    if (cartItems.size() == 0) { Runtime.trap("Cart is empty") };

    var totalPrice = 0;
    for (item in cartItems.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?p) { p };
      };
      if (product.stock < item.quantity) { Runtime.trap("Not enough stock for product: " # product.name) };
      totalPrice += product.price * item.quantity;
    };

    // Update stock
    for (item in cartItems.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found") };
        case (?p) { p };
      };
      products.add(
        item.productId,
        {
          id = product.id;
          name = product.name;
          category = product.category;
          description = product.description;
          price = product.price;
          imageUrl = product.imageUrl;
          stock = product.stock - item.quantity;
        },
      );
    };

    let order : Order = {
      id = nextOrderId;
      userId = caller;
      items = cartItems;
      totalPrice;
      status = "Pending";
      createdAt = 0;
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;

    // Clear cart
    userCarts.remove(caller);

    order.id;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    orders.values().toArray().filter(func(order) { order.userId == caller });
  };
};
