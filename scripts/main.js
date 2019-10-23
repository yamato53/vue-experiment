var eventBus = new Vue()

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true,
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true,
        }
    },
    template: `
        <div class="product">

        <div class="product-image">
        <img v-bind:src="image" alt="Socks" />
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if='inStock'>In Stock</p>
            <p v-else='!inStock' :class="{ 'out-of-stock': !inStock }">Out of Stock</p>
            <p v-if='onSale'
            :disable="!onSale"
            class="on-sale"><strong>ON SALE!</strong> Don't miss out! ^.^</p>
            <p>Shipping: {{ shipping }}</p>

            <ul>
                <li v-for="(detail, index) in details" :key="index">{{ detail }}</li>
            </ul>

            <div v-for="(variant, index) in variants"
                :key="variant.variantId"
                class="color-box"
                :style="{ backgroundColor: variant.variantColor }"
                @mouseover="updateProduct(index)"
                >
            </div>

            <div v-for="size in sizes" :key='size.sizeId'>
                <p>{{ size.sizeType }}</p>
            </div>

            <div class="cart-button">
                <button @click="addToCart"
                        :disabled="!inStock"
                        :class="{ disabledButton: !inStock }"
                        >
                        Add to Cart
                        </button>
                <button @click="removeFromCart"
                >
                Remove
                </button>
            </div>

            <product-tabs :reviews="reviews"></product-tabs>

        </div>

    </div>
    `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            sale: true,
            details: ["80% Cotton", "20% Polyester", "Gender-neutral"],

        variants: [
            {
                variantId: 2234,
                variantColor: "#84CF6A",
                variantImage: './assets/vmSocks-green-onWhite.jpg',
                variantQuantity: 10,
            },
            {
                variantId: 2235,
                variantColor: "#13438b",
                variantImage: './assets/vmSocks-blue-onWhite.jpg',
                variantQuantity: 0,
            }
        ],

        sizes: [
            {
                sizeId: 111,
                sizeType: "Small"
            },
            {
                sizeId: 112,
                sizeType: "Medium"
            },
            {
                sizeId: 113,
                sizeType: "Large"
            }
        ],
        reviews: []
        }
    },

    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId )  
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        onSale() {
            return this.sale
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return `$5.99`
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    } 
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

        <p v-if="errors.length">
            <b>Please fill out the following section(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>

        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name" required>
        </p>
    
        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review" required></textarea>
        </p>
    
        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating" required>
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>

        <p>Would you recommend this product?</p>

        <div>
            <label>
                Yes
                <input type="radio" value="Yes" v-model="recommend">
            </label>
        </div>

        <div>
            <label>
                No
                <input type="radio" value="No" v-model="recommend">
            </label>
        </div>
    
        <p>
            <input type="submit" value="Submit">
        </p>
  
  </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null,
                this.review = null,
                this.rating = null,
                this.recommend = null

            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommend) this.errors.push("Recommendation required.")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `

    <div>
      
    <ul>
      <span class="tabs" 
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs"
            @click="selectedTab = tab"
            :key="tab"
      >{{ tab }}</span>
    </ul>

    <div v-show="selectedTab === 'Reviews'">
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul v-else>
            <li v-for="(review, index) in reviews" :key="index">
              <p>{{ review.name }}</p>
              <p>{{ review.review }}</p>
              <p>Rating:{{ review.rating }} </p>
            </li>
        </ul>
    </div>

    <div v-show="selectedTab === 'Make aReview'">
      <product-review></product-review>
    </div>

  </div>
        
    `,
    data() {
        return {
            tabs: ['Reviews', ' Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

var app = new Vue ({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeItem(id) {
            for (let i = this.cart.length - 1; i >= 0; i--) {
                if (this.cart[i] === id) {
                    this.cart.splice(i, 1)
                }                
            }
        }
    }
})

