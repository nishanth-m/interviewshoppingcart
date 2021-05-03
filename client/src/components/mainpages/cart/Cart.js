import React, {useContext, useState, useEffect} from 'react'
import {GlobalState} from '../../../GlobalState'
import axios from 'axios'


function Cart() {
    const state = useContext(GlobalState)
    const [cart, setCart] = state.userAPI.cart
    const [token] = state.token
    const [total, setTotal] = useState(0)
    const [totaltax, setTotaltax] = useState(0)

    useEffect(() =>{
        const getTotal = () =>{
            const total = cart.reduce((prev, item) => {
                return prev + (((item.price)+((item.tax===0)?0:((item.price*item.tax)/100))+((item.imported)?((item.price*5)/100):0)) * item.quantity)
            },0)

        



            setTotal(parseFloat(total).toFixed(2))
           
        }
        const getTotalTax = ()=>{
            const totaltax = cart.reduce((prev, item) => {
                return prev + ((((item.tax===0)?0:((item.price*item.tax)/100))+((item.imported)?((item.price*5)/100):0)) * item.quantity)
            },0)

            setTotaltax(parseFloat(totaltax).toFixed(2))

        }
        getTotalTax()

        getTotal()

    },[cart])

    const addToCart = async (cart) =>{
        await axios.patch('/user/addcart', {cart}, {
            headers: {Authorization: token}
        })
    }


    const increment = (id) =>{
        cart.forEach(item => {
            if(item._id === id){
                item.quantity += 1
            }
        })

        setCart([...cart])
        addToCart(cart)
    }

    const decrement = (id) =>{
        cart.forEach(item => {
            if(item._id === id){
                item.quantity === 1 ? item.quantity = 1 : item.quantity -= 1
            }
        })

        setCart([...cart])
        addToCart(cart)
    }

    const removeProduct = id =>{
        if(window.confirm("Do you want to delete this product?")){
            cart.forEach((item, index) => {
                if(item._id === id){
                    cart.splice(index, 1)
                }
            })

            setCart([...cart])
            addToCart(cart)
        }
    }

    const tranSuccess = async(payment) => {
        const {paymentID, address} = payment;

        await axios.post('/api/payment', {cart, paymentID, address}, {
            headers: {Authorization: token}
        })

        setCart([])
        addToCart([])
        alert("You have successfully placed an order.")
    }


    if(cart.length === 0) 
        return <h2 style={{textAlign: "center", fontSize: "5rem"}}>Cart Empty</h2> 

    return (
        <div>
            {
                cart.map(product => (
                    <div className="cartdetail cart" key={product._id}>
                        <img src={product.images.url} alt="" />

                        <div className="cartbox-detail">
                            <h2>{product.title}</h2>

                            <h3>&#8377; {product.price * product.quantity}</h3>
                            <p>{product.description}</p>
                            <p>{product.content}</p>

                            <div className="amount">
                                <button onClick={() => decrement(product._id)}> - </button>
                                <span>{product.quantity}</span>
                                <button onClick={() => increment(product._id)}> + </button>
                            </div>
                            
                            <div className="delete" 
                            onClick={() => removeProduct(product._id)}>
                                X
                            </div>
                        </div>
                    </div>
                ))
            }
            <div className="totaltax">
            <h3>Total Tax: &#8377;{totaltax}</h3>
            </div>
            <div className="total">
                
                <h3>Total: &#8377; {total}</h3>
            </div>
        </div>
    )
}

export default Cart
