var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
export default {
    data() {
        return {
            store: this.$store,
            activeTab: 0,
            iframeIsReady: true,
            jsonIsReady: false,
            jsonFile: null,
            templateExists: false,
            devBuild: false,
            openModal: false,
            timerId: null,
            error: {
                hasError: false,
                message: null
            },
            indexStored: null,
            componentOptions: []
        };
    },
    watch: {
        // whenever question changes, this function will run
        jsonFile: {
            handler(val) {
                const debounce = this.debounced(1000, () => {
                    this.createOutput();
                    // delay so file can be created and then checked
                    setTimeout(() => {
                        axios.get('./output/template.html')
                            .then((response) => {
                            this.templateExists = true;
                        })
                            .catch((error) => {
                            this.templateExists = false;
                        });
                    }, 750);
                });
                debounce();
            },
            deep: true
        }
    },
    mounted: function () {
        this.fetchDefaultList();
        this.fetchCurrentBuild();
        this.refreshIframe();
    },
    methods: {
        debounced(delay, fn) {
            return (...args) => {
                if (this.timerId) {
                    clearTimeout(this.timerId);
                }
                this.timerId = setTimeout(() => {
                    fn(...args);
                    this.timerId = null;
                }, delay);
            };
        },
        fetchDefaultList(repurpose = false) {
            axios.get('/api/builddefault')
                .then((response) => {
                response.data.partials.map(partial => {
                    // uses default build list if build.json doesn't exists
                    if (repurpose) {
                        this.jsonFile = response.data;
                        this.jsonIsReady = true;
                    }
                });
                this.createComponentList(JSON.stringify(response.data));
            })
                .catch((error) => {
                this.devBuild = true;
                this.fetchDummyData();
            });
        },
        fetchCurrentBuild() {
            axios.get('./instructions/build.json')
                .then((response) => {
                // add focus property to textareas
                response.data.partials.map(partial => {
                    partial.content.map(item => {
                        if (item.type === 'textarea') {
                            item.focused = false;
                        }
                    });
                });
                // bind object
                this.jsonFile = response.data;
                this.jsonIsReady = true;
            })
                .catch((error) => {
                this.fetchDefaultList(true);
            });
        },
        fetchDummyData() {
            axios.get('./instructions/default.json')
                .then((response) => {
                // add focus property to textareas
                response.data.partials.map(partial => {
                    partial.content.map(item => {
                        if (item.type === 'textarea') {
                            item.focused = false;
                        }
                    });
                });
                this.createComponentList(JSON.stringify(response.data));
                // bind object
                this.jsonFile = response.data;
                this.jsonIsReady = true;
            })
                .catch((error) => {
                this.error.hasError = true;
                this.error.message = "Dummy data does not exists.  Run $gulp default once to create it.";
            });
        },
        createComponentList(list) {
            let partials = JSON.parse(list).partials;
            partials.map(partial => {
                partial.active = false;
                this.componentOptions.push(partial);
            });
        },
        selectedOption(selected) {
            this.openModal = false;
            let { content, location, name } = selected;
            if (this.indexStored !== 'new') {
                this.jsonFile.partials[this.indexStored].content = content;
                this.jsonFile.partials[this.indexStored].name = name;
                this.jsonFile.partials[this.indexStored].location = location;
            }
            else {
                let newContent = { content, name, location };
                this.jsonFile.partials.push(newContent);
            }
        },
        addNewSection() {
            this.indexStored = 'new';
            this.openModal = true;
        },
        array_move(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr; // for testing
        },
        moveItemUp(index) {
            if (index > 0) {
                this.array_move(this.jsonFile.partials, index, index - 1);
            }
        },
        moveItemDown(index) {
            if (index < this.jsonFile.partials.length - 1) {
                this.array_move(this.jsonFile.partials, index, index + 1);
            }
        },
        removeItem(index) {
            this.jsonFile.partials.splice(index, 1);
        },
        refreshIframe() {
            setInterval(() => {
                setTimeout(() => {
                    this.iframeIsReady = true;
                });
            }, 1000);
        },
        createOutput() {
            return __awaiter(this, void 0, void 0, function* () {
                this.iframeIsReady = false;
                yield axios.post('/api/buildJSON', this.jsonFile)
                    .then((response) => {
                    console.log(response);
                })
                    .catch((error) => {
                    console.log(error);
                });
            });
        },
    },
};
//# sourceMappingURL=emailGenerator.js.map