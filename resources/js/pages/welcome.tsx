import { Head, usePage } from "@inertiajs/react";
import WelcomeComponent from "../components/Frontend/Welcome";
import { FoodItem } from "@/types/frontend/Index";
import { CartItem } from "@/types";

interface PageProps {
  foodItems: FoodItem[];
  canRegister: boolean;
  cartItems:CartItem[];
}

const WelcomePage = ({ foodItems, canRegister, cartItems }:PageProps) => {
  
  return (
    <>
      <Head title="LTU Food" />
      <WelcomeComponent
        foodItems={foodItems}
        canRegister={canRegister}
        cartItems={cartItems}
       
      />
    </>
  );
};

export default WelcomePage;