import { useState, useRef, useEffect } from "react";
import { Table, Pagination } from "react-bootstrap";
import { tableFilters } from "../utils/uiConstants";
import { getDayMonthYear } from "../utils/utils";

const Home = () => {

    const [data, setData] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [page, setPage] = useState([]);
    const [filters, setFilters] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);

    const fullData = useRef([]);

    const tableHeader = useRef([]);

    const fileContentToObj = (fileContent) => {
        const dataList = [];
        tableHeader.current = null;
        fileContent.split('\n').forEach((line, index) => {
            if (index === 0) {
                tableHeader.current = ["No", ...line.split(",")];
            }
            else {
                const data = [index, ...line.split(",")];
                const obj = {};
                tableHeader.current.forEach((key, index) => {
                    obj[key] = data[index]
                });
                dataList.push(obj);
            }
        })
        setData(dataList);
        fullData.current = dataList;
    }

    const handleLoadFile = (e) => {
        const reader = new FileReader();
        reader.onload = () => {
            const strData = reader.result;
            fileContentToObj(strData);
        }
        reader.readAsText(e.target.files[0]);
    }

    useEffect(() => {
        const keys = Object.keys(filters);
        const values = Object.values(filters);
        const filteredData = fullData.current.filter((obj) => {
            return keys.every((k) => {
                if(obj["Date"]){
                    const { year, month } = getDayMonthYear(obj["Date"]);
                    switch(k){
                        case 'Date Year':                           
                            const y = values.find(y => y === year);
                            return obj['Date'].includes(y);
                        case 'Date Month':
                            const m = values.find(m => m === month);
                            return obj['Date'].includes(m);
                    }
                    
                }
                return values.includes(obj[k])
            })
          })
        setData(filteredData);
        setPageNo(1);
    }, [filters])

    useEffect(() => {
        const slice = data.slice((pageNo - 1) * 10, pageNo * 10);
        setPage(slice);
    }, [pageNo, data])

    const handleDecPage = () => {
        if (pageNo > 1) setPageNo(page => page - 1)
    }

    const handleIncPage = () => {
        if (pageNo < data.length-1)setPageNo(page => page + 1);
    }

    const getDateFilterData = (filterTerm) => {
        const filteredValues = new Set();
        
        switch(filterTerm){
            case 'Date Year':
                fullData.current.forEach(obj => {
                    if(obj["Date"]){
                        const { year } = getDayMonthYear(obj["Date"]);
                        filteredValues.add(year);
                    }
                })
                break;
            case 'Date Month':
                fullData.current.forEach(obj => {
                    if(obj["Date"]){
                        const { month } = getDayMonthYear(obj["Date"]);
                        filteredValues.add(month);
                    }
                })
                break;
        }
    
        return Array.from(filteredValues).filter(str => (str !== "" && str !== "-" && str !== undefined))
    }

    const getFilterData = (key) => {
        if(key === 'Date Year' || key === 'Date Month'){
            return getDateFilterData(key);
        }
        const filteredValues = new Set();
        fullData.current.forEach(obj => {
            filteredValues.add(obj[key]);
        })
        return Array.from(filteredValues).filter(str => (str !== "" && str !== "-" && str !== undefined));
    }

    const handleFilter = (e, key) => {
        setFilters(obj => {
            const temp = {...obj}
            temp[key] = e.target.value;
            return temp;
        });
    }

    const handleSelectRow = (obj) => {
        setSelectedRows(list => {
            if(list.includes(obj.No)){
                const filtered = list.filter(row => row !== obj.No);
                return filtered;
            } 
            else {
                return [...list, obj.No]
            }
        })
    }

    return (
        <div>
            <div className="p-2 d-flex justify-content-between align-items-center border border-bottom-2">
                <input type="file" accept=".csv" onChange={handleLoadFile} />
            </div>
            <hr/>
            <div className="d-flex gap-3 overflow-auto">
                {tableFilters.map(filterTerm => (
                    <div key={filterTerm} className="border border-1 rounded p-2">
                        <label className="me-2">{`Filter by ${filterTerm}`}</label>
                        <select onChange={(e) => handleFilter(e, filterTerm)}>
                            <option>{`select ${filterTerm}`}</option>
                            {getFilterData(filterTerm).map(value => (
                                <option value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <hr/>
            <div className="p-2 d-flex justify-content-center align-items-center">
                {page?.length > 0 && <Pagination className="m-0">
                    <Pagination.Prev onClick={handleDecPage} />
                    <Pagination.Item>{`${pageNo}/${Math.ceil(data.length / 10)}`}</Pagination.Item>
                    <Pagination.Next onClick={handleIncPage} />
                </Pagination>}
            </div>
            <div className="m-2 overflow-auto">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            {(tableHeader.current && tableHeader.current.length > 0) && tableHeader.current.map(k => (
                                <th key={k} className="bg-primary text-white">{k}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data && data.length > 0) && page.map((obj, index) => (
                            <tr onClick={() => handleSelectRow(obj)} className={selectedRows.includes(obj.No) ? "bg-success text-white" : ""}>
                                {tableHeader.current.map((header, index) => (
                                    <td>{obj[header]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Table>

            </div>
        </div>
    )
}

export default Home;