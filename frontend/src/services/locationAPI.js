import axios from 'axios';

/**
 * Fetches location details (District, State) using the Indian Postal Pincode API
 * @param {string} pincode 
 * @returns {Promise<{district: string, state: string} | null>}
 */
export const getLocationByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) return null;

    try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
        if (response.data && response.data[0].Status === 'Success') {
            const data = response.data[0].PostOffice[0];
            return {
                district: data.District,
                state: data.State
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching location from pincode:', error);
        return null;
    }
};
