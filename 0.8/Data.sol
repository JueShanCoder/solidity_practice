// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// Data types - values and references

contract ValueTypes {
    bool public b = true;
    uint public u = 123;
    int  public i = -123;
    int  public minInt = type(int).min;
    int  public maxInt = type(int).max;
}