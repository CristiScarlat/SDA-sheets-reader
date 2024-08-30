

export const getDayMonthYear = (date) => {
    const d = date?.split("-");
    const day = d[0].length === 4 ? d[2] : d[0];
    const month = d[1];
    const year = d[0].length === 4 ? d[0] : d[2];
    return { day, month, year };
}