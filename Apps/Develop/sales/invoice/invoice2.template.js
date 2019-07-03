/* type script code here */
const template = {
    properties: {
        "TDocument.Name"() { return this.MyText; },
        "TDocument.$XXX": String,
        "TDocument.$ZZZsds": Number
    },
    events: {
        "aaaa.SSSS.change"() { return this.$isEmpty; },
        "bbbb.tttt.change": docNoChanged
    },
    commands: {
        "aaaa": async function () {
            return await this.$vm.$invoke('myCommand345');
        }
    },
    delegates: {
        "myDelegate": (a, b) => a + b - 7,
        fetchCustomers
    }
};
module.exports = template;
function docNoChanged() {
    return this.$isNew;
}
function fetchCustomers(agent, text) {
    let vm = this.$vm;
    return vm.$invoke('fetchCustomer', { Text: text, Kind: 'Customer' });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52b2ljZTIudGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnZvaWNlMi50ZW1wbGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSwyQkFBMkI7QUFFM0IsTUFBTSxRQUFRLEdBQWM7SUFDM0IsVUFBVSxFQUFFO1FBQ1gsZ0JBQWdCLEtBQUssT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMxQyxnQkFBZ0IsRUFBRSxNQUFNO1FBQ3hCLG1CQUFtQixFQUFFLE1BQU07S0FDM0I7SUFDRCxNQUFNLEVBQUU7UUFDUCxrQkFBa0IsS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlDLGtCQUFrQixFQUFFLFlBQVk7S0FDaEM7SUFDRCxRQUFRLEVBQUU7UUFDVCxNQUFNLEVBQUUsS0FBSztZQUNaLE9BQU8sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUFDLENBQUM7S0FDakQ7SUFDRCxTQUFTLEVBQUU7UUFDVixZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDakMsY0FBYztLQUNkO0NBQ0QsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO0FBRzFCLFNBQVMsWUFBWTtJQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDcEIsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFhLEtBQUssRUFBRSxJQUFJO0lBQzlDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEIsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDdEUsQ0FBQyJ9