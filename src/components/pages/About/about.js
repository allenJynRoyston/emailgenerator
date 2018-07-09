import * as testimage from '../../../assets/images/site/short-paragraph.png';
export default {
    data() {
        return {
            store: this.$store,
            testimage: testimage,
            gridData_1: [
                { content: 'Box', location: { column: 1, row: 1 }, size: 2 },
                { content: 'Box', location: { column: 3, row: 1 }, size: 1 },
                { content: 'Box', location: { column: 3, row: 2 }, size: 1 },
                { content: 'Box', location: { column: 1, row: 3 }, size: 1 },
                { content: 'Box', location: { column: 2, row: 3 }, size: 1 },
                { content: 'Box', location: { column: 3, row: 3 }, size: 1 },
            ],
            gridData_2: [
                { content: 'Box', location: { column: 1, row: 1 }, size: 1 },
                { content: 'Box', location: { column: 2, row: 1 }, size: 2 },
                { content: 'Box', location: { column: 1, row: 2 }, size: 1 },
                { content: 'Box', location: { column: 1, row: 3 }, size: 1 },
                { content: 'Box', location: { column: 2, row: 3 }, size: 1 },
                { content: 'Box', location: { column: 3, row: 3 }, size: 1 },
                { content: 'Box', location: { column: 4, row: 1 }, size: 1 },
                { content: 'Box', location: { column: 4, row: 2 }, size: 1 },
                { content: 'Box', location: { column: 4, row: 3 }, size: 1 }
            ]
        };
    },
    mounted: function () {
        // axios.get('/api/test')
        //   .then(function (response) {
        //     console.log(response.data);
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   });    
    }
};
//# sourceMappingURL=about.js.map