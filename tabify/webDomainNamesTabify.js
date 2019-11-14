import ESTabify from "../elasticsearch/ESTabify";
import isEmpty from "lodash/isEmpty";

/*
    Sums up web domain name hits from two separate sum aggregations
 */
export default class WebDomainNamesTabify extends ESTabify {

    process(response) {
        const result =  super.process(response) || [];
        if (!isEmpty(result)) {
            const { WebDoms = [], WebDomsNested = [] } = result;
            WebDomsNested.forEach((itemInWebDomsNested) => {
                const itemInWebDoms = WebDoms.find(item => item.webDomainName === itemInWebDomsNested.webDomainName);
                if (itemInWebDoms) {
                    itemInWebDoms.SumOfHits += itemInWebDomsNested.SumOfHits
                } else {
                    WebDoms.push(itemInWebDomsNested);
                }
            })
            return WebDoms;
        }
        return result;
    }
}