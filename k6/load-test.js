import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 }
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    }
};

export default function () {
    let res = http.get('http://host.docker.internal:3000/todos');
    check(res, { 'status 200': (r) => r.status === 200 });
    sleep(1);
}