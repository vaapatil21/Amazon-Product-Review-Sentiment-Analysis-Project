import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Import the styles for DateRange component
import 'react-date-range/dist/theme/default.css'; // Import the default theme for DateRange component
import Sidebar from '../Sidebar/Sidebar';

const BarChart = ({ data }) => {
    const chartRef = useRef(null);
    const [chart, setChart] = useState(null);
    const [dateRange, setDateRange] = useState([
        {
            startDate: null,
            endDate: null,
            key: 'selection'
        }
    ]);

    // Handle date range change
    const handleDateRangeChange = (ranges) => {
        setDateRange([ranges.selection]);
    };

    // open close
    const [open, setOpen] = useState(false);

    // get the target element to toggle 
    const refOne = useRef(null);

    useEffect(() => {
        // event listeners
        document.addEventListener("click", hideOnClickOutside, true)
    }, [])

    // Hide on outside click
    const hideOnClickOutside = (e) => {
        if (refOne.current && !refOne.current.contains(e.target)) {
            setOpen(false)
        }
    }

    useEffect(() => {
        if (!chartRef.current || !data) return;

        // Destroy the previous chart if it exists
        if (chart) {
            chart.destroy();
        }

        // Filter data based on the selected date range
        const filteredData = data.filter(entry => {
            const date = new Date(entry.date);
            const startDate = dateRange[0].startDate;
            const endDate = dateRange[0].endDate;
            return (!startDate || date >= startDate) && (!endDate || date <= endDate);
        });

        const stackedData = filteredData.map(entry => ({
            date: entry.date,
            positive: entry.percentages.POSITIVE,
            negative: entry.percentages.NEGATIVE,
            neutral: entry.percentages.NEUTRAL,
            total: entry.percentages.POSITIVE + entry.percentages.NEUTRAL, // Sum of Positive and Neutral
        }));

        const ctx = chartRef.current.getContext('2d');
        const newChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: stackedData.map(entry => entry.date),
                datasets: [{
                    label: 'Positive',
                    data: stackedData.map(entry => entry.positive),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)', // Light blue color for Positive
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderSkipped: false
                }, {
                    label: 'Neutral',
                    data: stackedData.map(entry => entry.neutral),
                    backgroundColor: 'rgba(255, 206, 86, 0.5)', // Light yellow color for Neutral
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    borderSkipped: false
                }, {
                    label: 'Negative',
                    data: stackedData.map(entry => entry.negative),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)', // Light red color for Negative
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    borderSkipped: false
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const val = Math.abs(context.raw)
                                return `${context.dataset.label}: ${val}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            callback: function (value, index, values) {
                                return value + "%"; // Append "%" to each tick
                            }
                        },
                        font: {
                            weight: 'bold'
                        },
                        grid: {
                            color: (context) => {
                                const zeroLine = context.tick.value;
                                const gridColor = zeroLine === 0 ? '#666' : '#ccc';
                                return gridColor;
                            }
                        }
                    }
                }
            }
        });

        setChart(newChart);

        return () => {
            <Sidebar></Sidebar>
            newChart.destroy();
        };
    }, [data, dateRange]);

    return (
        <div style={{ position: 'relative' }}>
            {/* <div style={{ position: 'fixed', top: '10px', right: '10px' }}>
            <button onClick={() => window.history.back()}><CloseIcon /></button>
            </div> */}
            <button type="button" className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" style={{ position: 'fixed', top: '70px', right: '10px' }} onClick={() => window.history.back()}>
                <span className="sr-only">Close menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <input
                value={dateRange[0].startDate && dateRange[0].endDate ?
                    `${dateRange[0].startDate.toLocaleString('default', { month: 'short', year: 'numeric' })} to ${dateRange[0].endDate.toLocaleString('default', { month: 'short', year: 'numeric' })}` :
                    'Select Date Range'}
                readOnly
                className="inputBox"
                onClick={() => setOpen(open => !open)}
            />
            <div ref={refOne}>
                {open &&
                    <DateRange
                        editableDateInputs={true}
                        onChange={handleDateRangeChange}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                        startDatePlaceholder='Start Date'
                        endDatePlaceholder='End Date'
                        monthDisplayFormat='MMM yyyy'
                        minDate={new Date(2009, 0, 1)} // January 1, 2011
                        maxDate={new Date(2024, 11, 31)}
                        style={{ position: 'absolute', backgroundColor: 'white', left: '50%', transform: 'translateX(-50%)' }}
                    />
                }
            </div>

            <div className="canvasContainer">
                <canvas ref={chartRef} />
            </div>
        </div>
    );
};

export default BarChart;