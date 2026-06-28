<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'business_unit' => 'required|in:properti,karet',
            'nama_toko' => 'required|string|max:255',
            'nomor_telepon' => 'nullable|string|max:50',
            'alamat' => 'nullable|string',
        ];
    }

    public function attributes()
    {
        return [
            'business_unit' => 'Bisnis Unit',
            'nama_toko' => 'Nama Toko',
            'nomor_telepon' => 'Nomor Telepon',
            'alamat' => 'Alamat',
        ];
    }
}
