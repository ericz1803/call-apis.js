module.exports = class QueryBuilder {
    /**
     * Constructor for Query Builder
     * @param {object} edge - BTE Edge object with input field provided
     */
    constructor(edge) {
        this.POST_HEADER = { "content-type": "application/x-www-form-urlencoded" };
        this.edge = edge;
        this.server = edge.query_operation.server;
        if (edge.query_operation.server.endsWith('/')) {
            this.server = this.server.substring(0, this.server.length - 1)
        };
        this.url = this.server + edge.query_operation.path;
        this.method = edge.query_operation.method;
        this.supportBatch = edge.query_operation.supportBatch;
        this.input = edge.input;
        this.inputSeparator = edge.query_operation.inputSeparator;
        this.params = edge.query_operation.params;
        this.constructInput();
        this.constructRequestBody();
        this.constructParams();
        this.constructAxiosRequestConfig();
    }

    /**
     * Construct input based on method and inputSeparator
     */
    constructInput = () => {
        if (this.supportBatch === true) {
            this.input = this.input.join(this.inputSeparator);
        }
    }

    /**
     * Construct parameters for API calls
     */
    constructParams = () => {
        if (this.edge.query_operation.path_params) {
            this.edge.query_operation.path_params.map(param => {
                let val = this.params[param];
                this.url = this.url.replace("{" + param + "}", val).replace("{inputs[0]}", this.input);
                delete this.params[param];
            });
        }
        Object.keys(this.params).map(param => {
            if (typeof this.params[param] === 'string') {
                this.params[param] = this.params[param].replace("{inputs[0]}", this.input);
            }
        });
    }

    /**
     * Construct request body for API calls
     */
    constructRequestBody = () => {
        if (this.edge.query_operation.request_body !== undefined && "body" in this.edge.query_operation.request_body) {
            let body = this.edge.query_operation.request_body.body;
            this.data = Object.keys(body).reduce((accumulator, key) => accumulator + key + '=' + body[key].replace('{inputs[0]}', this.input) + '&', '');
            this.data = this.data.substring(0, this.data.length - 1)
        }
    }

    /**
     * Construct the request config for Axios reqeust.
     */
    constructAxiosRequestConfig = () => {
        this.config = {
            url: this.url,
            params: this.params,
            data: this.data,
            method: this.method
        }
    }
}