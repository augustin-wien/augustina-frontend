<script lang="ts" setup>
import IconCross from '@/components/icons/IconCross.vue'
import VendorMapView from '@/components/VendorMapView.vue'
import { vendorsStore } from '@/stores/vendor'
import { formatCredit } from '@/utils/utils'

const vendorStore = vendorsStore()
const vendor = vendorStore.vendor

const emit = defineEmits(['close'])
</script>

<template>
  <div
    id="vendorinfo-modal"
    tabindex="-1"
    class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50"
  >
    <div class="relative p-13 w-fit modal-content max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 dark:text-white">
        <div class="flex place-content-center justify-between pt-4 pr-4">
          <span />
          <button class="rounded-full bg-red-600 text-white font-bold" @click="emit('close')">
            <IconCross />
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mx-12 pb-4">
          <div class="md:col-span-2 overflow-x-auto">
            <table className="table-auto border-spacing-4 border-collapse profile-wrapper">
              <tbody className="text-sm text-left">
                <tr>
                  <td colspan="2">
                    <table className="w-full">
                      <tbody className="text-sm text-left">
                        <tr>
                          <th className="p-3">{{ $t('firstName') }}:</th>
                          <td className="p-3">{{ vendor?.FirstName }}</td>
                          <th className="p-3">{{ $t('lastName') }}:</th>
                          <td className="p-3">{{ vendor?.LastName }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('LicenseId') }}:</th>
                          <td className="p-3">{{ vendor?.LicenseID }}</td>
                          <th className="p-3">{{ $t('accountDeactivation') }}:</th>
                          <td className="p-3">{{ $t(vendor?.IsDisabled ? 'yes' : 'no') }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('lastPayout') }}:</th>
                          <td className="p-3">{{ vendor?.LastPayout }}</td>
                          <th className="p-3">{{ $t('currentCredit') }}:</th>
                          <td className="p-3">{{ formatCredit(vendor?.Balance) }} €</td>
                        </tr>
                        <tr>
                          <th className="p-3">E-Mail:</th>
                          <td className="p-3">{{ vendor?.Email }}</td>
                          <th className="p-3">{{ $t('telephone') }}:</th>
                          <td className="p-3">{{ vendor?.Telephone }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('address') }}:</th>
                          <td className="p-3">{{ vendor?.Address }}</td>
                          <th className="p-3">{{ $t('postCode') }}:</th>
                          <td className="p-3">{{ vendor?.PLZ }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('longitude') }}:</th>
                          <td className="p-3">{{ vendor?.Longitude }}</td>

                          <th className="p-3">{{ $t('latitude') }}:</th>
                          <td className="p-3">{{ vendor?.Latitude }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('location') }}:</th>
                          <td className="p-3">{{ vendor?.Location }}</td>
                          <th className="p-3">{{ $t('language') }}:</th>
                          <td className="p-3">{{ vendor?.Language }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('vendorSince') }}:</th>
                          <td className="p-3">{{ vendor?.VendorSince }}</td>

                          <th className="p-3">{{ $t('registrationDate') }}:</th>
                          <td className="p-3">{{ vendor?.RegistrationDate }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('workingTime') }}:</th>
                          <td className="p-3">{{ vendor?.WorkingTime }}</td>
                          <th className="p-3">Online Karte:</th>
                          <td className="p-3">{{ $t(vendor?.OnlineMap ? 'yes' : 'no') }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">Smartphone:</th>
                          <td className="p-3">{{ $t(vendor?.HasSmartphone ? 'yes' : 'no') }}</td>
                          <th className="p-3">{{ $t('bankAccount') }}:</th>
                          <td className="p-3">{{ $t(vendor?.HasBankAccount ? 'yes' : 'no') }}</td>
                        </tr>
                        <tr>
                          <th className="p-3">{{ $t('verificationLink') }}</th>
                          <td className="p-3">{{ vendor?.AccountProofUrl }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="w-full h-full overflow-hidden">
            <div
              v-if="
                vendor?.Latitude &&
                vendor?.Longitude &&
                vendor?.Latitude !== 0.1 &&
                vendor?.Longitude !== 0.1
              "
              class="w-full h-full"
            >
              <VendorMapView :vendors="[vendor]" :enable-search="false" />
            </div>
          </div>
        </div>
        <div class="flex justify-center items-center py-4">
          <router-link :to="`/backoffice/userprofile/${vendor?.ID}/update`">
            <button
              class="px-4 py-2 text-[16px] rounded-full h-[44px] customcolor mr-3 flex items-center"
            >
              {{ $t('change') }}
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
