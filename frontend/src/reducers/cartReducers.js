import {
    CART_ADD_ITEM,
    CART_REMOVE_ITEM,
    CART_SAVE_PAYMENT_METHOD,
    CART_SAVE_SHIPPING_ADDRESS,
    CLEAR_CART_ITEMS,
} from "../constants/cartConstants";

export const cartReducer = (
    state = { cartItems: [], shippingAddress: {} },
    action
) => {
    switch (action.type) {
        case CART_ADD_ITEM:
            const item = action.payload;

            let existedItem = state.cartItems.find(
                (x) => x.product === item.product
            );

            if (existedItem) {
                return {
                    ...state,
                    cartItems: state.cartItems.map((i) =>
                        i.product === existedItem.product ? item : i
                    ),
                };
            } else {
                return { ...state, cartItems: [...state.cartItems, item] };
            }
        case CART_REMOVE_ITEM:
            return {
                ...state,
                cartItems: state.cartItems.filter(
                    (item) => item.product !== action.payload
                ),
            };
        case CART_SAVE_SHIPPING_ADDRESS:
            return {
                ...state,
                shippingAddress: action.payload,
            };
        case CART_SAVE_PAYMENT_METHOD:
            return {
                ...state,
                paymentMethod: action.payload,
            };
        case CLEAR_CART_ITEMS:
            return {
                ...state,
                cartItems: [],
            };
        default:
            return state;
    }
};
