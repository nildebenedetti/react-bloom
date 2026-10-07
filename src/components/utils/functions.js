function generateMonthsRange(initialStr, lastStr) {
        const months = [];
        if (!initialStr || !lastStr) return months; //

        let [ year, month ] = initialStr.split('-').map( (elem) => Number(elem));

        const [ endYear, endMonth ] = lastStr.split('-').map( (elem) => Number(elem));

        while (year < endYear ||  year === endYear && month <= endMonth) {
            const monthString = `${year}-${String(month).padStart(2, '0')}`;
            months.push(monthString);
            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
        }

        return months;


}

export {
    generateMonthsRange,
}