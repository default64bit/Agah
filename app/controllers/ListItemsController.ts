import { Request, Response } from "express";

class AuthController {
    public async get_language_options(req: Request, res: Response, next) {
        return res.json({
            english: { name: "English", value: "en" },
            farsi: { name: "Farsi (فارسی)", value: "fa" },
            arabic: { name: "Arabic (العربية)", value: "ar" },
        });
    }

    public async get_number_format_options(req: Request, res: Response, next) {
        return res.json({
            a: { name: "Language Default", value: "a" },
            b: { name: "1,234.56", value: "b" },
            c: { name: "1.234,56", value: "c" },
            d: { name: "1 234,56", value: "d" },
        });
    }

    public async get_datetime_format_options(req: Request, res: Response, next) {
        return res.json({
            a: { name: "Language Default", value: "a" },
            b: { name: "March 14, 2015", value: "b" },
            c: { name: "14. March 2015", value: "c" },
            d: { name: "2015, March 14", value: "d" },
        });
    }

    public async get_timezone_options(req: Request, res: Response, next) {
        return res.json({
            "GMT-12:00a": { value: -12, name: "(GMT -12:00) Eniwetok" },
            "GMT-12:00b": { value: -12, name: "(GMT -12:00) Kwajalein" },
            "GMT-11:00c": { value: -11, name: "(GMT -11:00) Midway Island" },
            "GMT-11:00d": { value: -11, name: "(GMT -11:00) Samoa" },
            "GMT-10:00": { value: -10, name: "(GMT -10:00) Hawaii" },
            "GMT-9:00": { value: -9, name: "(GMT -9:00) Alaska" },
            "GMT-8:00": { value: -8, name: "(GMT -8:00) Pacific Time (US & Canada)" },
            "GMT-7:00": { value: -7, name: "(GMT -7:00) Mountain Time (US & Canada)" },
            "GMT-6:00a": { value: -6, name: "(GMT -6:00) Central Time (US & Canada)" },
            "GMT-6:00b": { value: -6, name: "(GMT -6:00) Mexico City" },
            "GMT-5:00a": { value: -5, name: "(GMT -5:00) Eastern Time (US & Canada)" },
            "GMT-5:00b": { value: -5, name: "(GMT -5:00) Bogota" },
            "GMT-5:00c": { value: -5, name: "(GMT -5:00) Lima" },
            "GMT-4:00a": { value: -4, name: "(GMT -4:00) Atlantic Time (Canada)" },
            "GMT-4:00b": { value: -4, name: "(GMT -4:00) Caracas" },
            "GMT-4:00c": { value: -4, name: "(GMT -4:00) La Paz" },
            "GMT-3:30": { value: -3.5, name: "(GMT -3:30) Newfoundland" },
            "GMT-3:00a": { value: -3, name: "(GMT -3:00) Brazil" },
            "GMT-3:00b": { value: -3, name: "(GMT -3:00) Buenos Aires" },
            "GMT-3:00c": { value: -3, name: "(GMT -3:00) Georgetown" },
            "GMT-2:00": { value: -2, name: "(GMT -2:00) Mid-Atlantic" },
            "GMT-1:00a": { value: -1, name: "(GMT -1:00) Azores" },
            "GMT-1:00b": { value: -1, name: "(GMT -1:00) Cape Verde Islands" },
            GMTa: { value: 0, name: "(GMT) Western Europe Time" },
            GMTb: { value: 0, name: "(GMT) London" },
            GMTc: { value: 0, name: "(GMT) Lisbon" },
            GMTd: { value: 0, name: "(GMT) Casablanca" },
            "GMT+1:00a": { value: 1, name: "(GMT +1:00) Brussels" },
            "GMT+1:00b": { value: 1, name: "(GMT +1:00) Copenhagen" },
            "GMT+1:00c": { value: 1, name: "(GMT +1:00) Madrid" },
            "GMT+1:00d": { value: 1, name: "(GMT +1:00) Paris" },
            "GMT+2:00a": { value: 2, name: "(GMT +2:00) Kaliningrad" },
            "GMT+2:00b": { value: 2, name: "(GMT +2:00) South Africa" },
            "GMT+3:00a": { value: 3, name: "(GMT +3:00) Baghdad" },
            "GMT+3:00b": { value: 3, name: "(GMT +3:00) Riyadh" },
            "GMT+3:00c": { value: 3, name: "(GMT +3:00) Moscow" },
            "GMT+3:00d": { value: 3, name: "(GMT +3:00) St. Petersburg" },
            "GMT+3:30": { value: 3.5, name: "(GMT +3:30) Tehran" },
            "GMT+4:00a": { value: 4, name: "(GMT +4:00) Abu Dhabi" },
            "GMT+4:00b": { value: 4, name: "(GMT +4:00) Muscat" },
            "GMT+4:00c": { value: 4, name: "(GMT +4:00) Baku" },
            "GMT+4:00d": { value: 4, name: "(GMT +4:00) Tbilisi" },
            "GMT+4:30": { value: 4.5, name: "(GMT +4:30) Kabul" },
            "GMT+5:00a": { value: 5, name: "(GMT +5:00) Ekaterinburg" },
            "GMT+5:00b": { value: 5, name: "(GMT +5:00) Islamabad" },
            "GMT+5:00c": { value: 5, name: "(GMT +5:00) Karachi" },
            "GMT+5:00d": { value: 5, name: "(GMT +5:00) Tashkent" },
            "GMT+5:30a": { value: 5.5, name: "(GMT +5:30) Bombay" },
            "GMT+5:30b": { value: 5.5, name: "(GMT +5:30) Calcutta" },
            "GMT+5:30c": { value: 5.5, name: "(GMT +5:30) Madras" },
            "GMT+5:30d": { value: 5.5, name: "(GMT +5:30) New Delhi" },
            "GMT+5:45": { value: 5.75, name: "(GMT +5:45) Kathmandu" },
            "GMT+6:00a": { value: 6, name: "(GMT +6:00) Almaty" },
            "GMT+6:00b": { value: 6, name: "(GMT +6:00) Dhaka" },
            "GMT+6:00c": { value: 6, name: "(GMT +6:00) Colombo" },
            "GMT+7:00a": { value: 7, name: "(GMT +7:00) Bangkok" },
            "GMT+7:00b": { value: 7, name: "(GMT +7:00) Hanoi" },
            "GMT+7:00c": { value: 7, name: "(GMT +7:00) Jakarta" },
            "GMT+8:00a": { value: 8, name: "(GMT +8:00) Beijing" },
            "GMT+8:00b": { value: 8, name: "(GMT +8:00) Perth" },
            "GMT+8:00c": { value: 8, name: "(GMT +8:00) Singapore" },
            "GMT+8:00d": { value: 8, name: "(GMT +8:00) Hong Kong" },
            "GMT+9:00a": { value: 9, name: "(GMT +9:00) Tokyo" },
            "GMT+9:00b": { value: 9, name: "(GMT +9:00) Seoul" },
            "GMT+9:00c": { value: 9, name: "(GMT +9:00) Osaka" },
            "GMT+9:00d": { value: 9, name: "(GMT +9:00) Sapporo" },
            "GMT+9:00e": { value: 9, name: "(GMT +9:00) Yakutsk" },
            "GMT+9:30a": { value: 9.5, name: "(GMT +9:30) Adelaide" },
            "GMT+9:30b": { value: 9.5, name: "(GMT +9:30) Darwin" },
            "GMT+10:00a": { value: 10, name: "(GMT +10:00) Eastern Australia" },
            "GMT+10:00b": { value: 10, name: "(GMT +10:00) Guam" },
            "GMT+10:00c": { value: 10, name: "(GMT +10:00) Vladivostok" },
            "GMT+11:00a": { value: 11, name: "(GMT +11:00) Magadan" },
            "GMT+11:00b": { value: 11, name: "(GMT +11:00) Solomon Islands" },
            "GMT+11:00c": { value: 11, name: "(GMT +11:00) New Caledonia" },
            "GMT+12:00a": { value: 12, name: "(GMT +12:00) Auckland" },
            "GMT+12:00b": { value: 12, name: "(GMT +12:00) Wellington" },
            "GMT+12:00c": { value: 12, name: "(GMT +12:00) Fiji" },
            "GMT+12:00d": { value: 12, name: "(GMT +12:00) Kamchatka" },
        });
    }

    public async get_cost_units(req: Request, res: Response, next) {
        return res.json({
            IRR: { name: "IRR - Iran Rial - ﷼", value: "IRR" },
            USD: { name: "USD - United States Dollar - $", value: "USD" },
            EUR: { name: "EUR - Euro - €", value: "EUR" },
            AED: { name: "AED - United Arab Emirates, Dirham - إ.د", value: "AED" },
            GBP: { name: "GBP - British Pound - £", value: "GBP" },
        });
    }

    public async get_business_types(req: Request, res: Response, next) {
        return res.json({
            "Farming Maintenance": { name: "Farming Maintenance", value: "Farming Maintenance" },
            "Building Management": { name: "Building Management", value: "Building Management" },
            "Equipment Management": { name: "Equipment Management", value: "Equipment Management" },
            "Facility Management": { name: "Facility Management", value: "Facility Management" },
            "Fleet Management": { name: "Fleet Management", value: "Fleet Management" },
            "General Asset Management": { name: "General Asset Management", value: "General Asset Management" },
            "Gym and Fitness Maintenance": { name: "Gym and Fitness Maintenance", value: "Gym and Fitness Maintenance" },
            Hospitality: { name: "Hospitality", value: "Hospitality" },
            "Property Management": { name: "Property Management", value: "Property Management" },
            "School Maintenance": { name: "School Maintenance", value: "School Maintenance" },
        });
    }
}

export default AuthController;
