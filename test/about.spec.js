import Vue from 'vue';
import About from '../src/components/About.vue'

describe("BoxArt component", () => {

  let data;

  beforeEach(() => {
    data = About.data();
  });

  afterEach(() => {

  });

  it('game triggered should be false', () => {
    expect(data.test).toBe('hello world')
  })
});
