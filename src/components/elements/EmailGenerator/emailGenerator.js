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
            resetFile: null,
            templateExists: false,
            devBuild: false,
            openModal: false,
            openPreviewModal: false,
            openSuccessModal: false,
            wittyRetort: null,
            timerId: null,
            options: [
                { id: 'autobuild', title: 'Auto Build', value: true, type: 'boolean', viisibleif: () => {
                        return true;
                    } },
                { id: 'builddelay', title: 'Build Delay', value: 1000, type: 'number', viisibleif: () => {
                        return this.setOptions.autobuild;
                    } },
            ],
            setOptions: {
                autobuild: true,
                buildDelay: null
            },
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
                const debounce = this.debounced(this.setOptions.buildDelay, () => {
                    this.createOutput();
                });
                debounce();
            },
            deep: true
        }
    },
    mounted: function () {
        this.setUserOptions();
        this.fetchDefaultList();
        this.fetchCurrentBuild();
    },
    methods: {
        //---------------------------------
        copyToClipboard() {
            const responses = ['Nice job hero.', 'Got it.', 'No prob.', 'Nailed that button click.', 'Easy peasy.', 'Copied.', 'Paste away.', 'It\'s done son.', 'Nae botha.', 'Success!'];
            this.wittyRetort = responses[Math.floor(Math.random() * responses.length)];
            navigator.clipboard.writeText(this.htmlPreview).then(() => {
                this.openSuccessModal = true;
                setTimeout(() => {
                    this.openSuccessModal = false;
                }, 1000);
            }, function (err) {
                console.error('Async: Could not copy text: ', err);
            });
        },
        //---------------------------------
        //---------------------------------
        setUserOptions() {
            let autobuild = this.options.filter(item => {
                return item.id === 'autobuild';
            });
            let delay = this.options.filter(item => {
                return item.id === 'builddelay';
            });
            this.setOptions.autobuild = autobuild[0].value;
            this.setOptions.buildDelay = delay[0].value;
        },
        //---------------------------------
        //---------------------------------
        fetchPreview() {
            return __awaiter(this, void 0, void 0, function* () {
                this.iframeIsReady = false;
                try {
                    let res = yield axios.get('/api/template');
                    this.htmlPreview = res.data;
                    this.templateExists = true;
                    this.iframeIsReady = true;
                }
                catch (_a) {
                    let res = yield axios.get('/output/test.html');
                    this.htmlPreview = res.data;
                    this.templateExists = true;
                    this.iframeIsReady = true;
                }
            });
        },
        //---------------------------------
        //---------------------------------
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
        //---------------------------------
        //---------------------------------
        fetchDefaultList(repurpose = false) {
            axios.get('/api/builddefault')
                .then((response) => {
                response.data.partials.map(partial => {
                    // uses default build list if build.json doesn't exists
                    if (repurpose) {
                        this.assignJsonFile(response.data);
                    }
                });
                this.createComponentList(JSON.stringify(response.data));
            })
                .catch((error) => {
                this.devBuild = true;
                this.fetchDummyData();
            });
        },
        //---------------------------------
        //---------------------------------
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
                this.assignJsonFile(response.data);
            })
                .catch((error) => {
                this.fetchDefaultList(true);
            });
        },
        //---------------------------------
        //---------------------------------
        fetchDummyData() {
            axios.get('./instructions/default.json')
                .then((response) => {
                // set resetdata
                this.resetFile = response.data;
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
                this.assignJsonFile(response.data);
            })
                .catch((error) => {
                this.error.hasError = true;
                this.error.message = "Dummy data does not exists.  Run $gulp default once to create it.";
            });
        },
        //---------------------------------
        //---------------------------------
        fetchHTMLPreview() {
        },
        //---------------------------------
        //---------------------------------
        assignJsonFile(data) {
            this.jsonFile = data;
            this.jsonIsReady = true;
        },
        //---------------------------------
        //---------------------------------
        createComponentList(list) {
            let partials = JSON.parse(list).partials;
            partials.map(partial => {
                partial.active = false;
                this.componentOptions.push(partial);
            });
        },
        //---------------------------------
        //---------------------------------
        selectedOption(selected) {
            this.openModal = false;
            let delinked = JSON.stringify(selected);
            let { content, location, name } = JSON.parse(delinked);
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
        //---------------------------------
        //---------------------------------
        addNewSection() {
            this.indexStored = 'new';
            this.openModal = true;
        },
        //---------------------------------
        //---------------------------------
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
        //---------------------------------
        //---------------------------------
        moveItemUp(index) {
            if (index > 0) {
                this.array_move(this.jsonFile.partials, index, index - 1);
            }
        },
        //---------------------------------
        //---------------------------------
        moveItemDown(index) {
            if (index < this.jsonFile.partials.length - 1) {
                this.array_move(this.jsonFile.partials, index, index + 1);
            }
        },
        //---------------------------------
        //---------------------------------
        removeItem(index) {
            this.jsonFile.partials.splice(index, 1);
        },
        //---------------------------------
        //---------------------------------
        resetBuild() {
            if (confirm("Continuing will reset all partial data.")) {
                this.jsonFile = this.resetFile;
                this.createOutput();
            }
        },
        //---------------------------------
        //---------------------------------
        createOutput() {
            this.iframeIsReady = false;
            axios.post('/api/buildJSON', this.jsonFile)
                .then(() => {
                this.fetchPreview();
            })
                .catch((error) => {
                this.fetchPreview();
            });
        },
    },
};
//# sourceMappingURL=emailGenerator.js.map