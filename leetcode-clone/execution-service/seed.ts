import { createClient, InsForgeClient } from '@insforge/sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../frontend/.env') });

const databaseUrl = process.env.VITE_INSFORGE_DATABASE_URL;
const databaseAnonKey = process.env.VITE_INSFORGE_DATABASE_ANON_KEY;

if (!databaseUrl || !databaseAnonKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const insforge: InsForgeClient = createClient({
    baseUrl: databaseUrl,
    anonKey: databaseAnonKey
});

const SAMPLE_PROBLEMS = [
    {
        title: 'Two Sum',
        slug: 'two-sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        difficulty: 'EASY',
        acceptance_rate: 48.5,
        tags: ['Array', 'Hash Table'],
        template_code: {
            javascript: "function twoSum(nums, target) {\n  \n}",
            python: "def twoSum(nums, target):\n    pass"
        },
        test_cases: [
            { input: "[2,7,11,15], 9", expected: "[0,1]" },
            { input: "[3,2,4], 6", expected: "[1,2]" }
        ]
    },
    {
        title: 'Valid Palindrome',
        slug: 'valid-palindrome',
        description: 'A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
        difficulty: 'EASY',
        acceptance_rate: 43.2,
        tags: ['String', 'Two Pointers'],
        template_code: {
            javascript: "function isPalindrome(s) {\n  \n}",
            python: "def isPalindrome(s):\n    pass"
        },
        test_cases: [
            { input: '"A man, a plan, a canal: Panama"', expected: "true" }
        ]
    },
    {
        title: 'Reverse Linked List',
        slug: 'reverse-linked-list',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        difficulty: 'MEDIUM',
        acceptance_rate: 55.4,
        tags: ['Linked List'],
        template_code: {
            javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nvar reverseList = function(head) {\n    \n};",
        },
        test_cases: []
    },
    {
        title: 'Container With Most Water',
        slug: 'container-with-most-water',
        description: 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).',
        difficulty: 'MEDIUM',
        acceptance_rate: 54.3,
        tags: ['Array', 'Two Pointers', 'Greedy'],
        template_code: {
            javascript: "var maxArea = function(height) {\n  \n};"
        },
        test_cases: []
    },
    {
        title: 'Merge Intervals',
        slug: 'merge-intervals',
        description: 'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
        difficulty: 'MEDIUM',
        acceptance_rate: 46.3,
        tags: ['Array', 'Sorting'],
        template_code: {
            javascript: "/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nvar merge = function(intervals) {\n    \n};",
            python: "def merge(intervals):\n    pass"
        },
        test_cases: [
            { input: "[[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]" }
        ]
    },
    {
        title: 'Best Time to Buy and Sell Stock',
        slug: 'best-time-to-buy-and-sell-stock',
        description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
        difficulty: 'EASY',
        acceptance_rate: 54.4,
        tags: ['Array', 'Dynamic Programming'],
        template_code: {
            javascript: "/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    \n};",
            python: "def maxProfit(prices):\n    pass"
        },
        test_cases: [
            { input: "[7,1,5,3,6,4]", expected: "5" }
        ]
    },
    {
        title: 'Maximum Subarray',
        slug: 'maximum-subarray',
        description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
        difficulty: 'MEDIUM',
        acceptance_rate: 50.3,
        tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
        template_code: {
            javascript: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    \n};",
            python: "def maxSubArray(nums):\n    pass"
        },
        test_cases: [
            { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" }
        ]
    },
    {
        title: 'Climbing Stairs',
        slug: 'climbing-stairs',
        description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 'EASY',
        acceptance_rate: 52.2,
        tags: ['Math', 'Dynamic Programming', 'Memoization'],
        template_code: {
            javascript: "/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n    \n};",
            python: "def climbStairs(n):\n    pass"
        },
        test_cases: [
            { input: "2", expected: "2" },
            { input: "3", expected: "3" }
        ]
    }
];

async function seed() {
    console.log('Seeding problems...');

    for (const problem of SAMPLE_PROBLEMS) {
        const { error } = await insforge.database
            .from('problems')
            .upsert([problem], { onConflict: 'slug' });

        if (error) {
            console.error(`Error seeding ${problem.title}:`, error.message);
        } else {
            console.log(`Seeded: ${problem.title}`);
        }
    }
}

seed();
