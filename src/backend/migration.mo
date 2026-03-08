import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    stock : Nat;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Order = {
    id : Nat;
    userId : Principal;
    items : [CartItem];
    totalPrice : Nat;
    status : Text;
    createdAt : Int;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    address : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
    userCarts : Map.Map<Principal, Map.Map<Nat, Nat>>;
    orders : Map.Map<Nat, Order>;
    productCategories : Set.Set<Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
  };

  type OrderItem = {
    productName : Text;
    quantity : Nat;
    unitPrice : Nat;
  };

  type CustomerOrder = {
    id : Nat;
    customerName : Text;
    customerEmail : Text;
    customerPhone : Text;
    customerAddress : Text;
    items : [OrderItem];
    totalPrice : Nat;
    paymentProofUrl : Text;
    status : Text;
    createdAt : Int;
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    userCarts : Map.Map<Principal, Map.Map<Nat, Nat>>;
    orders : Map.Map<Nat, Order>;
    customerOrders : Map.Map<Nat, CustomerOrder>;
    productCategories : Set.Set<Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextCustomerOrderId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      customerOrders = Map.empty<Nat, CustomerOrder>();
      nextCustomerOrderId = 1;
    };
  };
};
