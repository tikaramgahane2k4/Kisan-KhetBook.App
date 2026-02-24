import React, { useMemo } from 'react';
import { useTranslation } from '../i18n.jsx';

const CropAdvisory = ({ weather, activeCrops }) => {
    const { t } = useTranslation();

    const tips = useMemo(() => {
        if (!weather) return [];

        const condition = weather.weather[0].main;
        const temp = weather.main.temp;
        const humidity = weather.main.humidity;
        const windSpeed = weather.wind.speed * 3.6; // converting to km/h
        const newTips = [];

        // Temperature based tips
        if (temp > 35) {
            newTips.push({
                id: 'heat',
                type: 'warning',
                icon: '☀️',
                title: 'Extreme Heat Alert',
                message: 'Temperature is high. Increase irrigation frequency and avoid applying fertilizers or pesticides during noon to prevent leaf burn.'
            });
        } else if (temp < 10) {
            newTips.push({
                id: 'cold',
                type: 'info',
                icon: '❄️',
                title: 'Cold Weather Tip',
                message: 'Temperature is low. Ensure moisture in fields to protect winter crops from frost damage.'
            });
        }

        // Rain/Condition based tips
        if (['Rain', 'Drizzle', 'Thunderstorm'].includes(condition)) {
            newTips.push({
                id: 'rain',
                type: 'urgent',
                icon: '🌧️',
                title: 'Postpone Spraying',
                message: 'Recent or upcoming rain detected. Postpone any pesticide or fertilizer spraying to avoid chemical wash-off and wastage.'
            });
        } else if (humidity > 80) {
            newTips.push({
                id: 'fungus',
                type: 'info',
                icon: '🍄',
                title: 'High Humidity Warning',
                message: 'Humidity is above 80%. High risk of fungal diseases. Inspect crop leaves for spots or white powdery growth.'
            });
        }

        // Wind based tips
        if (windSpeed > 15) {
            newTips.push({
                id: 'wind',
                type: 'warning',
                icon: '💨',
                title: 'High Wind Alert',
                message: 'Wind speed is high. Avoid spraying chemicals as drift may affect neighboring fields or become ineffective.'
            });
        }

        // Crop specific tips (demo)
        if (activeCrops.some(c => c.toLowerCase().includes('wheat'))) {
            if (temp > 28) {
                newTips.push({
                    id: 'wheat-heat',
                    type: 'info',
                    icon: '🌾',
                    title: 'Wheat Heat Stress',
                    message: 'Wheat is sensitive to heat during grain filling. Keep the soil moist to help the plant cope with rising temperatures.'
                });
            }
        }

        // Default tip if nothing else matches
        if (newTips.length === 0) {
            newTips.push({
                id: 'default',
                type: 'success',
                icon: '🌱',
                title: 'Good Farming Conditions',
                message: 'Current weather is favorable for most field activities. Good time for weeding and general maintenance.'
            });
        }

        return newTips;
    }, [weather, activeCrops]);

    if (!weather && activeCrops.length === 0) return null;

    return (
        <div className="mb-8 no-print">
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:space-x-0 sm:gap-4 whitespace-nowrap sm:whitespace-normal">
                {tips.map((tip) => (
                    <div
                        key={tip.id}
                        className={`min-w-[280px] max-w-[320px] sm:min-w-0 sm:max-w-full p-5 rounded-3xl border shadow-sm flex flex-col justify-between whitespace-normal
              ${tip.type === 'warning' ? 'bg-amber-50 border-amber-100' : ''}
              ${tip.type === 'urgent' ? 'bg-red-50 border-red-100' : ''}
              ${tip.type === 'success' ? 'bg-emerald-50 border-emerald-100' : ''}
              ${tip.type === 'info' ? 'bg-blue-50 border-blue-100' : ''}
            `}
                    >
                        <div>
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="text-2xl">{tip.icon}</span>
                                <h4 className={`font-bold text-sm uppercase tracking-wider
                  ${tip.type === 'warning' ? 'text-amber-700' : ''}
                  ${tip.type === 'urgent' ? 'text-red-700' : ''}
                  ${tip.type === 'success' ? 'text-emerald-700' : ''}
                  ${tip.type === 'info' ? 'text-blue-700' : ''}
                `}>
                                    {tip.title}
                                </h4>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {tip.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropAdvisory;
