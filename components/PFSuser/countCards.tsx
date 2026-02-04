import { Package, Truck, AlertCircle, Calendar } from 'lucide-react';

const SHIPMENT_CARDS = [
  {
    title: "Total Shipments",
    value: "256",
    icon: Package,
    trend: "All-time",
    description: "shipments registered",
    color: {
      border: "border-blue-100",
      darkBorder: "dark:border-blue-900/50",
      text: "text-[#9B9B9B]",
      darkText: "dark:text-blue-200",
      iconBg: "bg-blue-100",
      darkIconBg: "dark:bg-blue-900/30",
      iconColor: "text-blue-600",
      darkIconColor: "dark:text-blue-400",
      descColor: "text-[#9B9B9B]",
      darkDescColor: "dark:text-blue-300"
    }
  },
  {
    title: "In Transit",
    value: "87",
    icon: Truck,
    trend: "Ongoing",
    description: "shipments moving",
    color: {
      border: "border-purple-100",
      darkBorder: "dark:border-purple-900/50",
      text: "text-[#9B9B9B]",
      darkText: "dark:text-purple-200",
      iconBg: "bg-purple-100",
      darkIconBg: "dark:bg-purple-900/30",
      iconColor: "text-purple-600",
      darkIconColor: "dark:text-purple-400",
      descColor: "text-[#9B9B9B]",
      darkDescColor: "dark:text-purple-300"
    }
  },
  {
    title: "Pending Bookings",
    value: "17",
    icon: Calendar,
    trend: "Waiting",
    description: "shipments pending",
    color: {
      border: "border-orange-100",
      darkBorder: "dark:border-orange-900/50",
      text: "text-[#9B9B9B]",
      darkText: "dark:text-orange-200",
      iconBg: "bg-orange-100",
      darkIconBg: "dark:bg-orange-900/30",
      iconColor: "text-orange-600",
      darkIconColor: "dark:text-orange-400",
      descColor: "text-[#9B9B9B]",
      darkDescColor: "dark:text-orange-300"
    }
  },
  {
    title: "Customs Exceptions",
    value: "152",
    icon: AlertCircle,
    trend: "Completed",
    description: "successfully delivered",
    color: {
      border: "border-red-100",
      darkBorder: "dark:border-red-900/50",
      text: "text-[#9B9B9B]",
      darkText: "dark:text-red-200",
      iconBg: "bg-red-100",
      darkIconBg: "dark:bg-red-900/30",
      iconColor: "text-red-600",
      darkIconColor: "dark:text-red-400",
      descColor: "text-[#9B9B9B]",
      darkDescColor: "dark:text-red-300"
    }
  },
  
];

export default function CountCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {SHIPMENT_CARDS.map((card, index) => (
        <div
          key={index}
          className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border ${card.color.border} ${card.color.darkBorder} overflow-hidden`}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${card.color.text} ${card.color.darkText}`}>
                {card.title}
              </h3>
              <div className={`p-2 rounded-lg ${card.color.iconBg} ${card.color.darkIconBg} ${card.color.iconColor} ${card.color.darkIconColor}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{card.value}</p>
            <p className={`text-sm ${card.color.descColor} ${card.color.darkDescColor}`}>
              {card.trend} {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
