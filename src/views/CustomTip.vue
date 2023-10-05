<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore';
import { settingsStore } from '@/stores/settings';
import { RouterLink } from 'vue-router';

const settStore = settingsStore()
const paymentStore = usePaymentStore()

const increment = paymentStore.increment
const decrement = paymentStore.decrement

const onlyForCurrency = ($event: any) => {
    let keycode = $event.keyCode ? $event.keyCode : $event.which;

    // only allow number and one dot
    if ((keycode < 48 || keycode > 57) && (keycode !== 46 || paymentStore.tip.toString().indexOf('.') !== -1)) {
        $event.preventDefault();
        return;
    }

    // restrict to 2 decimal places
    if (paymentStore.tip !== null && paymentStore.tip !== undefined) {
        const parts = paymentStore.tip.toString().split('.');

        if (parts.length > 1) {
            const decimalPart = parts[1];
            const hasMoreThanTwoDecimals = decimalPart?.length > 2;
            const hasLeadingZeros = decimalPart?.startsWith('0') && decimalPart !== '0';

            if (hasMoreThanTwoDecimals || hasLeadingZeros) {
                $event.preventDefault();
            }
        }
    }
};

const roundValue = () => {
    if (paymentStore.tip !== null && paymentStore.tip !== undefined) {
        // Convert to number, round to two decimal places, and then convert back to a string
        paymentStore.tip = parseFloat(Number(paymentStore.tip).toFixed(2));

    }
};


</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 place-items-center">
                <div className="text-center font-semibold text-3xl row-span-2">
                    {{ $t("customdonation") }}
                </div>
                <div className="grid grid-cols-5 w-full h-full">
                    <button @click="decrement()">
                        <div class="button-down customcolor"></div>
                    </button>
                    <div
                        class="col-span-3 grid grid-cols-3 lightcolor bg-opacity-0 text-white rounded-3xl border-spacing-7 place-items-center">
                        <input type="number" v-model.number="paymentStore.tip" @keypress="onlyForCurrency" class="customcolor col-span-2 text-white text-center text-6xl font-semibold border-2 customborder
                        rounded-3xl w-full h-full">
                        <p className="text-6xl font-semibold text-left">€ </p>
                    </div>
                    <button @click="increment">
                        <div class="button-up customcolor ml-3"></div>
                    </button>
                </div>
                <div>

                </div>
                <div className="flex place-items-center w-full">
                    <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
                        <button @click="roundValue"
                            class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full">
                            {{ $t("next") }}
                        </button>
                    </RouterLink>
                </div>
            </div>
        </template>
    </component>
</template>

<style scoped>
input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
}

.button-up,
.button-down {
    position: relative;
    padding: 5px;
    height: 50px;
    width: 50px;
    border-radius: 50%;
    transition: all 0.2s linear;
}

.button-down {
    margin-right: auto;
}

.button-up {
    margin-left: auto;
}

.button-up::after,
.button-down::after {
    content: "";
    position: absolute;
    left: 15px;
    z-index: 11;
    display: block;
    width: 20px;
    height: 20px;
    border-top: 2px solid #fff;
    border-left: 2px solid #fff;
}

.button-up::after {
    top: 20px;
    transform: rotate(45deg);
}

.button-down::after {
    top: 10px;
    transform: rotate(225deg);
}

.customcolor {
    background-color: v-bind(settStore.settings.Color);
}

.customborder {
    border-color: v-bind(settStore.settings.Color);
}

.lightcolor {
    background-color: v-bind(settStore.settings.Color);
}
</style>