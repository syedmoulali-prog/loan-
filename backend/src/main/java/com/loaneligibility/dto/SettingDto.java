package com.loaneligibility.dto;

public class SettingDto {
    private String key;
    private String value;
    private String category;

    public SettingDto() {}

    public SettingDto(String key, String value, String category) {
        this.key = key;
        this.value = value;
        this.category = category;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
