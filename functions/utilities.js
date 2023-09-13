const aprilFools = () => new Date().getMonth() === 3 && new Date().getDate() === 1;

module.exports = {
    aprilFools,
};