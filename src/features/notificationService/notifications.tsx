import { Toast } from "flowbite-react";
import { HiCheck, HiX, HiExclamation } from 'react-icons/hi';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../../app/store';
import { Notification } from "../../interface";
import { useEffect } from "react";
import { removeNotification } from "./notificationSlice";

const notificationIcons = {
    'success': <HiCheck className="h-5 w-5" />,
    'info': <HiExclamation className="h-5 w-5" />,
    'error': <HiX className="h-5 w-5" />
}

const notificationClasses = {
    'success': 'bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200',
    'info': 'bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200',
    'error': 'bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200'
}

export default function Notifcations() {
    const notifications = useSelector((state: RootState) => state.notification)

    return (
        <div className="absolute flex flex-col gap-4 w-full p-4">
            {notifications.map(notification => <NotificationUI data={notification} />)}
        </div>
    );
}

function NotificationUI({ data }: { data: Notification }) {
    const dispatch = useDispatch();

    useEffect(() => {
        if(data.timed)
        setTimeout(() => {
            dispatch(removeNotification(data.id))
        }, 3000);
    }, [])

    return (<Toast className="m-auto z-10 border-[1px]">
        <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notificationClasses[data.type]}`}>
            {notificationIcons[data.type]}
        </div>
        <div className="ml-3 text-sm font-normal">
            {data.message}
        </div>
        <Toast.Toggle onClick={() => dispatch(removeNotification(data.id))}/>
    </Toast>)
}
