import moment from 'moment';

export function formatDate(date: string) {
    return moment(date).startOf('hour').fromNow(); 
}