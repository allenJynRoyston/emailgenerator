import axios from 'axios';
export default {
    data() {
        return {
            store: this.$store,
            iframeIsReady: true,
            jsonIsReady: false,
            jsonFile: null,
        };
    },
    mounted: function () {
        axios.get('./instructions/build.json')
            .then((response) => {
            this.jsonFile = response.data;
            this.jsonIsReady = true;
            console.log(this.jsonFile);
        })
            .catch((error) => {
            console.log(error);
        });
    },
    methods: {
        refreshIframe() {
            setTimeout(() => {
                this.iframeIsReady = true;
            }, 3000);
        },
        createOutput() {
            this.iframeIsReady = false;
            axios.post('/api/buildJSON', this.jsonFile)
                .then((response) => {
                this.refreshIframe();
                console.log(response);
            })
                .catch((error) => {
                this.refreshIframe();
                console.log(error);
            });
        }
    },
};
//# sourceMappingURL=home.js.map