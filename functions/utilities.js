module.exports = {
    aprilFools: () => (({getMonth: a, getDate: b}) => [a, b].map(x => x()) == [3, 1])(new Date())
};